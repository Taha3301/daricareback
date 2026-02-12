import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column({ name: 'reference_id', nullable: true })
    reference_id: number;

    @Column('text')
    message: string;

    @Column({ name: 'is_read', default: false })
    is_read: boolean;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}
