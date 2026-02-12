import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zones')
export class Zone {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cityName: string;
}
