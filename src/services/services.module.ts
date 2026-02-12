import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './services.entity';
import { SoinsModule } from '../soins/soins.module';
import { ProfessionalModule } from '../professional/professional.module';
import { RequestDocument } from '../bookings/entities/request-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, RequestDocument]),
    SoinsModule,
    ProfessionalModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule { }
