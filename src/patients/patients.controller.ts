import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { Patient } from './patient.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all patients (Protected)' })
    @ApiResponse({ status: 200, description: 'Return all patients.', type: [Patient] })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async findAll(): Promise<Patient[]> {
        return this.patientsService.findAll();
    }
}
