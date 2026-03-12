import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from '../patients/patient.entity';

@Entity('avis')
export class Avis {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Note de 1 à 5 étoiles', minimum: 1, maximum: 5 })
  @Column({ type: 'int' })
  rating: number; // 1 to 5 stars

  @ApiProperty({ description: 'Commentaire laissé par le patient', nullable: true })
  @Column({ type: 'text', nullable: true })
  comment: string;

  @ApiProperty({ description: 'Le patient est-il recommandé ?', nullable: true })
  @Column({ nullable: true })
  wouldRecommend: boolean;

  @ApiProperty({ description: 'Titre court de l\'avis', nullable: true })
  @Column({ nullable: true })
  title: string;

  @ApiProperty({ description: 'L\'avis est-il approuvé par l\'admin ?' })
  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // --- Relation ---
  @ApiProperty({ type: () => Patient })
  @OneToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ApiProperty()
  @Column({ name: 'patient_id', unique: true })
  patientId: number;
}
