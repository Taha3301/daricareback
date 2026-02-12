import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { MedicalRequest } from './entities/medical-request.entity';
import { RequestSoin } from './entities/request-soin.entity';
import { RequestDocument } from './entities/request-document.entity';
import { Professional } from '../professional/entities/professional.entity';
import { NotificationModule } from '../notification/notification.module';
import { MedicalRequestProfessional } from './entities/medical-request-professional.entity';
import { PatientsModule } from '../patients/patients.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedicalRequest,
            RequestSoin,
            RequestDocument,
            Professional,
            MedicalRequestProfessional
        ]),
        NotificationModule,
        PatientsModule,
    ],
    controllers: [BookingsController],
    providers: [BookingsService],
    exports: [BookingsService],
})
export class BookingsModule { }
