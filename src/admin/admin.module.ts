import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { Professional } from '../professional/entities/professional.entity';
import { AdminController } from './admin.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { MedicalRequest } from '../bookings/entities/medical-request.entity';
import { Service } from '../services/services.entity';
import { MedicalRequestProfessional } from '../bookings/entities/medical-request-professional.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      Professional,
      MedicalRequest,
      Service,
      MedicalRequestProfessional
    ]),
    BookingsModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [TypeOrmModule],
})
export class AdminModule { }
