import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, Patch, Param, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('admin/register')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin Only: Register a new administrator' })
    @ApiResponse({ status: 201, description: 'Admin successfully registered' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only admins can register new admins' })
    async adminRegister(@Body() registerAdminDto: RegisterAdminDto) {
        return this.authService.registerAdmin(registerAdminDto);
    }

    @Post('professional/register')
    @ApiOperation({ summary: 'Register a new healthcare professional' })
    async professionalRegister(@Body() registerDto: RegisterDto) {
        return this.authService.registerProfessional(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Unified login for Admin or Professional' })
    @ApiResponse({ status: 200, description: 'Return JWT token, user role, name and status' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.loginUnified(loginDto);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send a password reset link to the user email' })
    @ApiResponse({ status: 200, description: 'Success: Reset link sended with the mail' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password using the token sent via email' })
    @ApiResponse({ status: 200, description: 'Success: Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid or expired token' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.userId, req.user.role);
    }

    @Get('users')
    @ApiOperation({ summary: 'Get all users (Unified)' })
    async findAll() {
        return this.authService.getAllUsers();
    }

    @Get('professionals/documents')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin Only: Get all professionals with their documents' })
    async getProfessionalsWithDocs() {
        return this.authService.getAllProfessionalsWithDocuments();
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user profile' })
    async updateProfile(@Request() req, @Body() updateData: UpdateUserDto) {
        return this.authService.updateProfile(req.user.userId, req.user.role, updateData);
    }

    @Patch('admin/user/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin or Self: Update user by ID' })
    async adminUpdateUser(@Request() req, @Param('id') id: string, @Body() updateData: UpdateUserDto) {
        if (req.user.role !== 'admin' && req.user.userId !== +id) {
            throw new ForbiddenException('Forbidden resource: You can only update your own profile');
        }
        return this.authService.adminUpdateUser(+id, updateData);
    }
}
