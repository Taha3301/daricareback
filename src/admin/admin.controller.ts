import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingsService } from '../bookings/bookings.service';
import { AdminService } from './admin.service';
import { BanUserDto } from './dto/ban-user.dto';

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
}
