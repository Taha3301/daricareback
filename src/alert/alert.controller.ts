import { Controller, Post, Get, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertController {
    constructor(private readonly alertService: AlertService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Send an alert to a professional for document re-verification (Admin only)' })
    create(@Body() createAlertDto: CreateAlertDto) {
        return this.alertService.createAlert(createAlertDto);
    }

    @Get('professional/:professionalId')
    @ApiOperation({ summary: 'Get all alerts for a professional' })
    findAllByProfessional(@Param('professionalId') professionalId: string) {
        return this.alertService.getAlertsByProfessional(+professionalId);
    }

    @Post(':id/toggle-update')
    @UseGuards(RolesGuard)
    @Roles('admin', 'professional')
    @ApiOperation({ summary: 'Toggle the update status of an alert (Admin or Owner professional)' })
    toggleUpdate(@Param('id') id: string, @Req() req) {
        return this.alertService.toggleUpdate(+id, req.user);
    }
}
