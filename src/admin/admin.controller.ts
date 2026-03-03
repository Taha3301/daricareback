import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingsService } from '../bookings/bookings.service';
import { AdminService } from './admin.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UpdateWhatsappDto } from '../user/dto/update-whatsapp.dto';
import { UpdateSuperadminDto } from './dto/update-superadmin.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
    constructor(
        private readonly bookingsService: BookingsService,
        private readonly adminService: AdminService,
    ) { }

    @Get('users')
    @ApiOperation({ summary: 'Admin Only: Get all admin users' })
    @ApiResponse({ status: 200, description: 'Return all admin users (password excluded)' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only admins can access this' })
    async getAllAdmins() {
        return this.adminService.getAllAdmins();
    }

    @Get('dashboard/stats')
    @ApiOperation({ summary: 'Get summary statistics for the admin dashboard' })
    @ApiResponse({ status: 200, description: 'Return counts, revenue, and popularity metrics' })
    async getStats() {
        return this.adminService.getDashboardStats();
    }

    @Get('requests/summary')
    @ApiOperation({ summary: 'Get all requests with detailed summary for admin' })
    @ApiResponse({ status: 200, description: 'Return all requests with status, accepted professional, and distance.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getAllRequests() {
        return this.bookingsService.findAllRequestsForAdmin();
    }

    @Get('requests/detailed')
    @ApiOperation({ summary: 'Get all medical requests with accepted professional, total cost, and detailed info' })
    @ApiResponse({ status: 200, description: 'Return all requests with complete details.' })
    async getDetailedRequests() {
        return this.bookingsService.findAllRequestsDetailed();
    }

    @Patch('users/:id/ban')
    @ApiOperation({ summary: 'Admin Only: Ban or unban a user' })
    @ApiResponse({ status: 200, description: 'User ban status updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only admins can ban users' })
    async banUser(
        @Param('id') id: string,
        @Body() banUserDto: BanUserDto,
    ) {
        return this.adminService.banUser(+id, banUserDto.ban);
    }

    @Patch('users/:id/whatsapp')
    @ApiOperation({ summary: 'Admin Only: Toggle WhatsApp status for a user' })
    @ApiResponse({ status: 200, description: 'User WhatsApp status updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only admins can change WhatsApp status' })
    async toggleWhatsapp(
        @Param('id') id: string,
        @Body() updateWhatsappDto: UpdateWhatsappDto,
    ) {
        return this.adminService.updateWhatsappStatus(+id, updateWhatsappDto.whatsapp);
    }

    @Patch('users/:id/superadmin')
    @ApiOperation({ summary: 'Admin Only: Toggle superadmin status for a user' })
    @ApiResponse({ status: 200, description: 'User superadmin status updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only admins can change superadmin status' })
    async toggleSuperadmin(
        @Param('id') id: string,
        @Body() updateSuperadminDto: UpdateSuperadminDto,
    ) {
        return this.adminService.updateSuperadminStatus(+id, updateSuperadminDto.superadmin);
    }

    @Get('users/:id/superadmin')
    @ApiOperation({ summary: 'Admin Only: Get superadmin status for a user' })
    @ApiResponse({ status: 200, description: 'User superadmin status retrieved successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only admins can view superadmin status' })
    async getSuperadmin(
        @Param('id') id: string,
    ) {
        return this.adminService.getSuperadminStatus(+id);
    }
}
