import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MedicalRequest } from './medical-request.entity';

@Entity('request_documents')
export class RequestDocument {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MedicalRequest, (request) => request.documents)
    @JoinColumn({ name: 'request_id' })
    medicalRequest: MedicalRequest;

    @ApiProperty()
    @Column({ name: 'request_id' })
    requestId: number;

    @ApiProperty()
    @Column()
    filePath: string;

    @ApiProperty()
    @Column()
    fileOriginalName: string;

    @ApiProperty()
    @Column()
    mimeType: string;
}
