import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { Alert } from './entities/alert.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Document } from '../documents/documents.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Alert, Professional, Document])],
    controllers: [AlertController],
    providers: [AlertService],
    exports: [AlertService],
})
export class AlertModule { }
