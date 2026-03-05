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
        // Create new patient for every request to ensure independent data
        const newPatient = this.patientRepository.create(data);
        return await this.patientRepository.save(newPatient);
    }

    async findAll(): Promise<Patient[]> {
        return await this.patientRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
}
