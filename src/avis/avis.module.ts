import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avis } from './avis.entity';
import { Patient } from '../patients/patient.entity';
import { AvisService } from './avis.service';
import { AvisController } from './avis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Avis, Patient])],
  controllers: [AvisController],
  providers: [AvisService],
  exports: [AvisService],
})
export class AvisModule {}
