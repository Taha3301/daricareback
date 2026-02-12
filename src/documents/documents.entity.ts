import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Professional } from '../professional/entities/professional.entity';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    type: string;


    @Column({ nullable: false })
    filePath: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'boolean', default: false, nullable: false })
    verified: boolean;

    @Column({ nullable: false })
    professionalId: number;

    @ManyToOne(() => Professional, (professional) => professional.documents)
    @JoinColumn({ name: 'professionalId' })
    professional: Professional;
}
