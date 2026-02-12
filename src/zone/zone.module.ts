import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZoneService } from './zone.service';
import { ZoneController } from './zone.controller';
import { Zone } from './zone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Zone])],
  controllers: [ZoneController],
  providers: [ZoneService],
  exports: [ZoneService, TypeOrmModule],
})
export class ZoneModule { }
