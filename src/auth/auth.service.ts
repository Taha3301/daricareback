import { Injectable, UnauthorizedException, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../admin/admin.entity';
import { Professional } from '../professional/entities/professional.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../user/user.entity';
import { ZoneService } from '../zone/zone.service';
import { NotificationService } from '../notification/notification.service';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @InjectRepository(Professional)
        private proRepository: Repository<Professional>,
        private jwtService: JwtService,
        private zoneService: ZoneService,
        private notificationService: NotificationService,
    ) { }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;

        // Try to find user in both repositories
        let user: any = await this.adminRepository.findOne({ where: { email } });
        if (!user) {
            user = await this.proRepository.findOne({ where: { email } });
        }

        if (!user) {
            throw new NotFoundException('User with this email does not exist');
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

        const repo = (user instanceof Admin ? this.adminRepository : this.proRepository) as Repository<any>;
        await repo.save(user);

        // Send email (we'll implement this in NotificationService)
        try {
            await this.notificationService.sendResetPasswordEmail(email, token);
        } catch (error) {
            console.error('Failed to send reset password email:', error);
            throw new InternalServerErrorException('Failed to send email. Please check SMTP configuration.');
        }

        return { message: 'Password reset link sent to your email' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;

        // Find user by token in both repositories
        let user: any = await this.adminRepository.findOne({
            where: { resetPasswordToken: token }
        });
        let repo: Repository<any> = this.adminRepository;

        if (!user) {
            user = await this.proRepository.findOne({
                where: { resetPasswordToken: token }
            });
            repo = this.proRepository;
        }

        if (!user || user.resetPasswordExpires < new Date()) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await repo.save(user);

        return { message: 'Password has been reset successfully' };
    }

    async registerAdmin(registerAdminDto: RegisterAdminDto) {
        const { email, password } = registerAdminDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = this.adminRepository.create({ email, password: hashedPassword });
        return this.adminRepository.save(admin);
    }

    async registerProfessional(registerDto: RegisterDto) {
        const { email, password, name, city } = registerDto;
        const hashedPassword = await bcrypt.hash(password, 10);

        let finalCity = city;
        let finalAddress = registerDto.professionalAddress;

        // 1. Prioritize GPS Logic (Reverse Geocoding)
        if (registerDto.latitude !== undefined && registerDto.longitude !== undefined) {
            const geoData = await this.zoneService.reverseGeocode(registerDto.latitude, registerDto.longitude);
            if (geoData) {
                if (!finalCity) finalCity = geoData.name;
                if (!finalAddress) finalAddress = geoData.fullAddress;
            }
        }
        // 2. Fallback to City-based search if GPS is missing
        else if (city) {
            const photonResults = await this.zoneService.searchByPhoton(city);
            if (photonResults.length > 0 && !finalAddress) {
                finalAddress = photonResults[0].fullAddress;
            }
        }

        const pro = this.proRepository.create({
            ...registerDto,
            password: hashedPassword,
            city: finalCity,
            professionalAddress: finalAddress,
        });
        return this.proRepository.save(pro);
    }

    async loginUnified(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Try Admin first
        const admin = await this.adminRepository.findOne({ where: { email } });
        if (admin && (await bcrypt.compare(password, admin.password))) {
            // Check if user is banned
            if (admin.ban) {
                throw new UnauthorizedException('Your account has been banned. Please contact support.');
            }

            const payload = {
                email: admin.email,
                sub: admin.id,
                role: 'admin',
                name: admin.name,
                status: 'ACCEPTED' // Admins are always validated 
            };
            return {
                access_token: this.jwtService.sign(payload),
                role: 'admin',
                name: admin.name,
                status: 'ACCEPTED',
                ban: admin.ban
            };
        }

        // Try Professional
        const pro = await this.proRepository.findOne({ where: { email } });
        if (pro && (await bcrypt.compare(password, pro.password))) {
            // Check if user is banned
            if (pro.ban) {
                throw new UnauthorizedException('Your account has been banned. Please contact support.');
            }

            const payload = {
                email: pro.email,
                sub: pro.id,
                role: 'professional',
                name: pro.name,
                status: pro.status
            };
            return {
                access_token: this.jwtService.sign(payload),
                role: 'professional',
                name: pro.name,
                status: pro.status,
                ban: pro.ban
            };
        }

        throw new UnauthorizedException('Invalid credentials');
    }

    async getProfile(userId: number, role: string) {
        if (role === 'admin') {
            return this.adminRepository.findOne({ where: { id: userId } });
        } else if (role === 'professional') {
            return this.proRepository.findOne({ where: { id: userId }, relations: ['documents'] });
        }
        throw new UnauthorizedException('User profile not found');
    }

    async getAllProfessionalsWithDocuments() {
        return this.proRepository.find({ relations: ['documents'] });
    }

    async getAllUsers() {
        // Since we use STI, querying the 'admin' repository or 'pro' repository 
        // with TypeORM might only return those types. 
        // We should inject the base User repository to get everyone.
        return this.adminRepository.manager.find('User');
    }

    async updateProfile(userId: number, role: string, updateData: UpdateUserDto) {
        const isProfessional = role === 'professional';
        const repo = isProfessional ? this.proRepository : this.adminRepository;

        const user = await (repo as Repository<any>).findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User profile not found');

        // Automation Layer
        if (isProfessional) {
            // Priority 1: GPS Update
            if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
                const geoData = await this.zoneService.reverseGeocode(updateData.latitude, updateData.longitude);
                if (geoData) {
                    if (!updateData.city) updateData.city = geoData.name;
                    if (!updateData.professionalAddress) updateData.professionalAddress = geoData.fullAddress;
                }
            }
        }

        const cleanData = this.filterUpdateData(updateData, isProfessional);
        Object.assign(user, cleanData);

        try {
            return await (repo as Repository<any>).save(user);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                throw new ConflictException('Email already exists');
            }
            throw error;
        }
    }

    async adminUpdateUser(userId: number, updateData: UpdateUserDto) {
        // Try finding as professional first
        let user: any = await this.proRepository.findOne({ where: { id: userId } });
        let isProfessional = true;
        let repo: Repository<any> = this.proRepository;

        if (!user) {
            user = await this.adminRepository.findOne({ where: { id: userId } });
            isProfessional = false;
            repo = this.adminRepository;
        }

        if (!user) throw new NotFoundException('User not found');

        // Automation Layer
        if (isProfessional) {
            if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
                const geoData = await this.zoneService.reverseGeocode(updateData.latitude, updateData.longitude);
                if (geoData) {
                    if (!updateData.city) updateData.city = geoData.name;
                    if (!updateData.professionalAddress) updateData.professionalAddress = geoData.fullAddress;
                }
            }
        }

        const cleanData = this.filterUpdateData(updateData, isProfessional);
        Object.assign(user, cleanData);

        try {
            return await repo.save(user);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                throw new ConflictException('Email already exists');
            }
            throw error;
        }
    }

    private filterUpdateData(data: UpdateUserDto, isProfessional: boolean): any {
        const { speciality, cin, diploma, license, yearsOfExperience, adeliRppsNumber, professionalPhone, professionalAddress, city, latitude, longitude, ...baseData } = data;
        if (isProfessional) {
            return { ...data };
        }
        return baseData;
    }
}
