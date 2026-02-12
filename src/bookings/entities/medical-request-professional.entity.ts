import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicalRequest } from './medical-request.entity';
import { Professional } from '../../professional/entities/professional.entity';

export enum AssignmentStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DENIED = 'denied',
}

@Entity('medical_request_professional')
export class MedicalRequestProfessional {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MedicalRequest, (request) => request.id)
    @JoinColumn({ name: 'medical_request_id' })
    medicalRequest: MedicalRequest;

    @ApiProperty()
    @Column({ name: 'medical_request_id' })
    medicalRequestId: number;

    @ManyToOne(() => Professional, (prof) => prof.id)
    @JoinColumn({ name: 'professional_id' })
    professional: Professional;

    @ApiProperty()
    @Column({ name: 'professional_id' })
    professionalId: number;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    message: string;

    @ApiProperty({ enum: AssignmentStatus })
    @Column({
        type: 'enum',
        enum: AssignmentStatus,
        default: AssignmentStatus.PENDING,
    })
    status: AssignmentStatus;

    @ApiPropertyOptional({ example: 5.2 })
    @Column({ type: 'float', nullable: true })
    distance: number;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}
