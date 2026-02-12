import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MedicalRequest } from './medical-request.entity';
import { Soin } from '../../soins/soins.entity';

export enum VisitType {
    ONCE = 'once',
    RECURRING = 'recurring',
}

@Entity('request_soins')
export class RequestSoin {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MedicalRequest, (request) => request.requestSoins)
    @JoinColumn({ name: 'request_id' })
    medicalRequest: MedicalRequest;

    @ApiProperty()
    @Column({ name: 'request_id' })
    requestId: number;

    @ManyToOne(() => Soin, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'soin_id' })
    soin: Soin;

    @ApiProperty()
    @Column({ name: 'soin_id' })
    soinId: number;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    answers: any;

    @ApiProperty({ enum: VisitType })
    @Column({ type: 'enum', enum: VisitType })
    visitType: VisitType;

    @ApiProperty()
    @Column({ nullable: true })
    frequencyCount: number;

    @ApiProperty()
    @Column({ nullable: true })
    frequencyPeriod: string;
}
