import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Soin } from '../soins/soins.entity';

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ nullable: true })
    image: string;

    @OneToMany(() => Soin, (soin) => soin.service)
    soins: Soin[];
}
