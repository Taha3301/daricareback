import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, TableInheritance } from 'typeorm';

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: Gender, nullable: true })
    gender: Gender;

    @Column({ nullable: true })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordExpires: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: false })
    ban: boolean;

    @Column({ default: false })
    whatsapp: boolean;

    @Column({ default: false })
    superadmin: boolean;
}
