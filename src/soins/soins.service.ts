import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSoinDto } from './dto/create-soin.dto';
import { UpdateSoinDto } from './dto/update-soin.dto';
import { Soin } from './soins.entity';

@Injectable()
export class SoinsService {
  constructor(
    @InjectRepository(Soin)
    private readonly soinRepository: Repository<Soin>,
  ) { }

  async create(createSoinDto: CreateSoinDto) {
    const soin = this.soinRepository.create(createSoinDto);
    return await this.soinRepository.save(soin);
  }

  async findAll() {
    return await this.soinRepository.find({
      relations: ['service', 'checkboxes', 'radios', 'dropdowns', 'texts']
    });
  }

  async findByServiceId(serviceId: number) {
    return await this.soinRepository.find({
      where: { serviceId },
      relations: ['checkboxes', 'radios', 'dropdowns', 'texts']
    });
  }

  async findOne(id: number) {
    const soin = await this.soinRepository.findOne({
      where: { id },
      relations: ['service', 'checkboxes', 'radios', 'dropdowns', 'texts'],
    });
    if (!soin) {
      throw new NotFoundException(`Soin with ID ${id} not found`);
    }
    return soin;
  }

  async update(id: number, updateSoinDto: UpdateSoinDto) {
    const soin = await this.findOne(id);
    const updated = Object.assign(soin, updateSoinDto);
    return await this.soinRepository.save(updated);
  }

  async remove(id: number) {
    const soin = await this.findOne(id);
    return await this.soinRepository.remove(soin);
  }
}
