import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, TableInheritance } from 'typeorm';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

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
}
