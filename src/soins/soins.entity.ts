import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Service } from '../services/services.entity';
import { SoinCheckbox } from './entities/checkbox.entity';
import { SoinRadio } from './entities/radio.entity';
import { SoinDropdown } from './entities/dropdown.entity';
import { SoinText } from './entities/text.entity';

@Entity('soins')
export class Soin {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'float', default: 0 })
    price: number;

    @ManyToOne(() => Service, (service) => service.soins)
    @JoinColumn({ name: 'serviceId' })
    service: Service;

    @Column()
    serviceId: number;

    @OneToMany(() => SoinCheckbox, (item) => item.soin, { cascade: true })
    checkboxes: SoinCheckbox[];

    @OneToMany(() => SoinRadio, (item) => item.soin, { cascade: true })
    radios: SoinRadio[];

    @OneToMany(() => SoinDropdown, (item) => item.soin, { cascade: true })
    dropdowns: SoinDropdown[];

    @OneToMany(() => SoinText, (item) => item.soin, { cascade: true })
    texts: SoinText[];
}
