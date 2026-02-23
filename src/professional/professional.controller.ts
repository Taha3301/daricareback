import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfessionalService } from './professional.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Patch } from '@nestjs/common';

@ApiTags('professionals')
@Controller('professionals')
export class ProfessionalController {
    constructor(private readonly professionalService: ProfessionalService) { }

    @Get('analytics')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get personal analytics for the logged-in professional' })
    @ApiResponse({ status: 200, description: 'Return earnings, statistics, and graph data.' })
    async getAnalytics(@Request() req) {
        // req.user contains the decoded JWT payload (id, email, etc.)
        return this.professionalService.getAnalytics(req.user.userId);
    }

    @Patch('whatsapp')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Professional: Flip WhatsApp status using only token (no body required)' })
    @ApiResponse({ status: 200, description: 'WhatsApp status flipped successfully' })
    async toggleWhatsapp(@Request() req) {
        return this.professionalService.toggleWhatsappStatus(req.user.userId);
    }
}
