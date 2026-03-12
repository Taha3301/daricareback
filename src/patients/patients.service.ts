import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { PatientCivility } from '../bookings/entities/medical-request.entity';

export interface SyncPatientDto {
    civility: PatientCivility;
    firstname: string;
    lastname: string;
    birthdate: Date;
    phone: string;
    email?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) { }

    async syncPatient(data: SyncPatientDto): Promise<Patient> {
        // Check if patient already exists by phone or email
        const existingPatient = await this.patientRepository.findOne({
            where: [
                { phone: data.phone },
                ...(data.email ? [{ email: data.email }] : [])
            ]
        });

        if (existingPatient) {
            // Update existing patient with the latest information
            // Note: We don't overwrite ID or createdAt
            Object.assign(existingPatient, data);
            return await this.patientRepository.save(existingPatient);
        }

        // Create new patient if none found
        const newPatient = this.patientRepository.create(data);
        return await this.patientRepository.save(newPatient);
    }

    async findAll(): Promise<Patient[]> {
        return await this.patientRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
}
