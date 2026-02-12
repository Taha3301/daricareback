import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalService } from './professional.service';
import { Professional } from './entities/professional.entity';
import { ProfessionalController } from './professional.controller';
import { MedicalRequest } from '../bookings/entities/medical-request.entity';
import { MedicalRequestProfessional } from '../bookings/entities/medical-request-professional.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Professional,
      MedicalRequest,
      MedicalRequestProfessional
    ])
  ],
  controllers: [ProfessionalController],
  providers: [ProfessionalService],
  exports: [TypeOrmModule],
})
export class ProfessionalModule { }
