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
        // Check if patient exists by phone or email
        let patient = await this.patientRepository.findOne({
            where: [
                { phone: data.phone },
                ...(data.email ? [{ email: data.email }] : [])
            ]
        });

        if (patient) {
            // Update existing patient with newest data
            patient.civility = data.civility;
            patient.firstname = data.firstname;
            patient.lastname = data.lastname;
            patient.birthdate = data.birthdate;
            // Only update email if it was provided and different
            if (data.email) {
                patient.email = data.email;
            }
            patient.phone = data.phone;
            patient.address = data.address;
            patient.latitude = data.latitude;
            patient.longitude = data.longitude;
            return await this.patientRepository.save(patient);
        } else {
            // Create new patient
            const newPatient = this.patientRepository.create(data);
            return await this.patientRepository.save(newPatient);
        }
    }

    async findAll(): Promise<Patient[]> {
        return await this.patientRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
}
