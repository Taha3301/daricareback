import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PatientCivility } from '../bookings/entities/medical-request.entity';

@Entity('patients')
export class Patient {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ enum: PatientCivility })
    @Column({ type: 'enum', enum: PatientCivility })
    civility: PatientCivility;

    @ApiProperty()
    @Column()
    firstname: string;

    @ApiProperty()
    @Column()
    lastname: string;

    @ApiProperty()
    @Column({ type: 'date', nullable: true })
    birthdate: Date;

    @ApiProperty()
    @Column({ unique: true })
    phone: string;

    @ApiProperty()
    @Column({ unique: true, nullable: true })
    email: string;

    @ApiProperty()
    @Column({ nullable: true })
    address: string;

    @ApiProperty()
    @Column({ type: 'float', nullable: true })
    latitude: number;

    @ApiProperty()
    @Column({ type: 'float', nullable: true })
    longitude: number;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;
}
