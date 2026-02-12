import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Professional } from '../../professional/entities/professional.entity';
import { Document } from '../../documents/documents.entity';

@Entity('alerts')
export class Alert {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    comment: string;

    @Column()
    professionalId: number;

    @Column('int', { array: true, default: '{}' })
    unverifiedDocIds: number[];

    @ManyToOne(() => Professional, (professional) => professional.alerts)
    professional: Professional;

    @ManyToMany(() => Document)
    @JoinTable()
    documents: Document[];

    @Column({ type: 'boolean', default: false })
    update: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
