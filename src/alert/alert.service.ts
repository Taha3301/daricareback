import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Professional, ProfessionalStatus } from '../professional/entities/professional.entity';
import { Document } from '../documents/documents.entity';

@Injectable()
export class AlertService {
    constructor(
        @InjectRepository(Alert)
        private alertRepository: Repository<Alert>,
        @InjectRepository(Professional)
        private proRepository: Repository<Professional>,
        @InjectRepository(Document)
        private docRepository: Repository<Document>,
    ) { }

    async createAlert(createAlertDto: CreateAlertDto) {
        const { professionalId, documentIds, comment, update } = createAlertDto;

        // 1. Verify professional exists
        const professional = await this.proRepository.findOne({ where: { id: professionalId } });
        if (!professional) {
            throw new NotFoundException(`Professional with ID ${professionalId} not found`);
        }

        // 2. Verify documents exist
        const documents = await this.docRepository.find({
            where: { id: In(documentIds) }
        });

        if (documents.length !== documentIds.length) {
            throw new NotFoundException('Some documents were not found');
        }

        // 3. Create the alert
        const alert = this.alertRepository.create({
            comment,
            professionalId,
            documents,
            unverifiedDocIds: documentIds,
            update: update ?? false,
        });

        // 4. Update documents' verified status to false
        documents.forEach(doc => doc.verified = false);
        await this.docRepository.save(documents);

        // 5. Revert professional status if they were ACCEPTED
        if (professional.status === ProfessionalStatus.ACCEPTED) {
            professional.status = ProfessionalStatus.PENDING;
            await this.proRepository.save(professional);
        }

        // 6. Save alert
        return this.alertRepository.save(alert);
    }

    async getAlertsByProfessional(professionalId: number) {
        return this.alertRepository.find({
            where: { professionalId },
            relations: ['documents'],
            order: { createdAt: 'DESC' }
        });
    }

    async toggleUpdate(id: number, user: any) {
        const alert = await this.alertRepository.findOne({ where: { id } });
        if (!alert) {
            throw new NotFoundException(`Alert with ID ${id} not found`);
        }

        // Ownership check: professionals can only toggle their own alerts
        if (user.role === 'professional' && alert.professionalId !== user.userId) {
            throw new ForbiddenException('You can only update your own alerts');
        }

        alert.update = !alert.update;
        return this.alertRepository.save(alert);
    }
}
