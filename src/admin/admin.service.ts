import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { Professional } from '../professional/entities/professional.entity';
import { MedicalRequest } from '../bookings/entities/medical-request.entity';
import { Service } from '../services/services.entity';
import { MedicalRequestProfessional } from '../bookings/entities/medical-request-professional.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(MedicalRequest)
    private medicalRequestRepository: Repository<MedicalRequest>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(MedicalRequestProfessional)
    private assignmentRepository: Repository<MedicalRequestProfessional>,
  ) { }

  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  async getDashboardStats() {
    const totalAdmins = await this.adminRepository.count();
    const totalProfessionals = await this.professionalRepository.count();
    const pendingProfessionals = await this.professionalRepository.count({ where: { status: 'PENDING' as any } });

    const requests = await this.medicalRequestRepository.find({
      relations: ['service'],
    });

    const totalRevenue = requests
      .filter(r => r.status === 'done' || r.status === 'accepted')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    const statusCounts = {
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      done: requests.filter(r => r.status === 'done').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };

    // Service Popularity
    const serviceStats = {};
    requests.forEach(r => {
      const name = r.service?.name || 'Inconnu';
      if (!serviceStats[name]) {
        serviceStats[name] = { count: 0, revenue: 0 };
      }
      serviceStats[name].count++;
      if (r.status === 'done' || r.status === 'accepted') {
        serviceStats[name].revenue += (r.totalPrice || 0);
      }
    });

    const topServices = Object.entries(serviceStats)
      .map(([name, data]: [string, any]) => ({
        name,
        ...data,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent Activity (last 5 requests)
    const recentRequests = requests
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        patientName: `${r.patientFirstname} ${r.patientLastname}`,
        service: r.service?.name,
        status: r.status,
        date: r.createdAt,
      }));

    return {
      summary: {
        totalRevenue,
        totalRequests: requests.length,
        totalProfessionals,
        pendingProfessionals,
        totalAdmins,
      },
      requestStatus: statusCounts,
      topServices,
      recentRequests,
    };
  }

  async banUser(userId: number, banStatus: boolean) {
    // Try to find user in Admin repository
    let user: any = await this.adminRepository.findOne({ where: { id: userId } });
    let repo: Repository<any> = this.adminRepository;

    // If not found in Admin, try Professional
    if (!user) {
      user = await this.professionalRepository.findOne({ where: { id: userId } });
      repo = this.professionalRepository;
    }

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.ban = banStatus;
    await repo.save(user);

    return {
      message: `User ${banStatus ? 'banned' : 'unbanned'} successfully`,
      userId: user.id,
      email: user.email,
      ban: user.ban,
    };
  }
}
