import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './documents.entity';
import { Professional } from '../professional/entities/professional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Professional])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [TypeOrmModule],
})
export class DocumentsModule { }
