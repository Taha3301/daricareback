import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Soin } from '../soins.entity';

@Entity('soin_checkboxes')
export class SoinCheckbox {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('simple-array')
    choices: string[];

    @ManyToOne(() => Soin, (soin) => soin.checkboxes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'soinId' })
    soin: Soin;

    @Column()
    soinId: number;
}
