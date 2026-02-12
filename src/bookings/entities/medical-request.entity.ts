import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Service } from '../../services/services.entity';
import { RequestSoin } from './request-soin.entity';
import { RequestDocument } from './request-document.entity';

export enum PatientCivility {
    M = 'M',
    MME = 'Mme',
}

export enum RequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    DONE = 'done',
}

export enum PrescriptionStatus {
    AVAILABLE = 'available',
    PENDING = 'pending',
}

@Entity('medical_requests')
export class MedicalRequest {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Service)
    @JoinColumn({ name: 'service_id' })
    service: Service;

    @ApiProperty()
    @Column({ name: 'service_id' })
    serviceId: number;

    @ApiProperty({ enum: PatientCivility })
    @Column({ type: 'enum', enum: PatientCivility })
    patientCivility: PatientCivility;

    @ApiProperty()
    @Column()
    patientFirstname: string;

    @ApiProperty()
    @Column()
    patientLastname: string;

    @ApiProperty()
    @Column({ type: 'date' })
    patientBirthdate: Date;

    @ApiProperty()
    @Column()
    patientPhone: string;

    @ApiProperty()
    @Column({ nullable: true })
    patientEmail: string;

    @ApiProperty()
    @Column({ type: 'text' })
    address: string;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    addressComplement: string;

    @ApiProperty()
    @Column({ default: false })
    isIndifferent: boolean;

    @ApiPropertyOptional({ example: 48.8566 })
    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @ApiPropertyOptional({ example: 2.3522 })
    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @ApiProperty()
    @Column({ type: 'date' })
    startDate: Date;

    @ApiProperty()
    @Column()
    durationMode: string;

    @ApiProperty()
    @Column()
    durationValue: number;

    @ApiProperty()
    @Column({ type: 'time' })
    availabilityStart: string;

    @ApiProperty()
    @Column({ type: 'time' })
    availabilityEnd: string;

    @ApiProperty({ enum: PrescriptionStatus })
    @Column({ type: 'enum', enum: PrescriptionStatus, nullable: true })
    prescriptionStatus: PrescriptionStatus;

    @ApiProperty({ enum: RequestStatus })
    @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
    status: RequestStatus;

    @ApiProperty()
    @Column({ type: 'float', nullable: true })
    totalPrice: number;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ type: () => [RequestSoin] })
    @OneToMany(() => RequestSoin, (requestSoin) => requestSoin.medicalRequest)
    requestSoins: RequestSoin[];

    @ApiProperty({ type: () => [RequestDocument] })
    @OneToMany(() => RequestDocument, (doc) => doc.medicalRequest)
    documents: RequestDocument[];
}
