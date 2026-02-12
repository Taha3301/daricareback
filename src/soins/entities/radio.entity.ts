import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Soin } from '../soins.entity';

@Entity('soin_radios')
export class SoinRadio {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('simple-array')
    choices: string[];

    @ManyToOne(() => Soin, (soin) => soin.radios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'soinId' })
    soin: Soin;

    @Column()
    soinId: number;
}
