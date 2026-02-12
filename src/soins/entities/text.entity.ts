import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Soin } from '../soins.entity';

@Entity('soin_texts')
export class SoinText {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Soin, (soin) => soin.texts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'soinId' })
    soin: Soin;

    @Column()
    soinId: number;
}
