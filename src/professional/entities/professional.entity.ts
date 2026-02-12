import { Column, ChildEntity, OneToMany } from 'typeorm';
import { User } from '../../user/user.entity';
import { Document } from '../../documents/documents.entity';
import { Alert } from '../../alert/entities/alert.entity';

export enum ProfessionalStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    SUSPENDED = 'SUSPENDED',
}

@ChildEntity('professional')
export class Professional extends User {
    @Column({ nullable: true })
    speciality: string;

    @Column({ nullable: true })
    cin: string;

    @Column({ nullable: true })
    diploma: string;

    @Column({ nullable: true })
    license: string;

    @Column({
        type: 'enum',
        enum: ProfessionalStatus,
        default: ProfessionalStatus.PENDING,
    })
    status: ProfessionalStatus;

    @Column({ default: 0 })
    yearsOfExperience: number;

    @Column({ nullable: true })
    adeliRppsNumber: string;

    @Column({ nullable: true })
    professionalPhone: string;

    @Column({ nullable: true })
    professionalAddress: string;

    @Column({ nullable: true })
    city: string;

    @Column({ type: 'float', nullable: true })
    latitude: number;

    @Column({ type: 'float', nullable: true })
    longitude: number;

    @OneToMany(() => Document, (document) => document.professional)
    documents: Document[];

    @OneToMany(() => Alert, (alert) => alert.professional)
    alerts: Alert[];
}
