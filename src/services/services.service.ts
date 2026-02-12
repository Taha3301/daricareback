import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './services.entity';
import { Professional } from '../professional/entities/professional.entity';
import { RequestDocument } from '../bookings/entities/request-document.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(RequestDocument)
    private readonly requestDocumentRepository: Repository<RequestDocument>,
  ) { }

  async create(createServiceDto: CreateServiceDto) {
    const service = this.serviceRepository.create(createServiceDto);
    return await this.serviceRepository.save(service);
  }

  async findAll() {
    return await this.serviceRepository.find({
      relations: [
        'soins',
        'soins.checkboxes',
        'soins.radios',
        'soins.dropdowns',
        'soins.texts'
      ]
    });
  }

  async findAllOnly() {
    return await this.serviceRepository.find();
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: [
        'soins',
        'soins.checkboxes',
        'soins.radios',
        'soins.dropdowns',
        'soins.texts'
      ],
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async findByName(name: string) {
    const service = await this.serviceRepository.findOne({
      where: { name },
      relations: [
        'soins',
        'soins.checkboxes',
        'soins.radios',
        'soins.dropdowns',
        'soins.texts'
      ],
    });
    if (!service) {
      throw new NotFoundException(`Service with name ${name} not found`);
    }
    return service;
  }

  async findByProfessionalSpeciality(userId: number) {
    const professional = await this.professionalRepository.findOne({
      where: { id: userId },
    });

    if (!professional) {
      throw new NotFoundException(`Professional with ID ${userId} not found`);
    }

    const service = await this.serviceRepository.findOne({
      where: { name: professional.speciality },
      relations: [
        'soins',
        'soins.checkboxes',
        'soins.radios',
        'soins.dropdowns',
        'soins.texts'
      ],
    });

    if (!service) {
      throw new NotFoundException(`Service for speciality ${professional.speciality} not found`);
    }

    const medicalRequestDocuments = await this.requestDocumentRepository.find({
      where: {
        medicalRequest: {
          serviceId: service.id
        }
      }
    });

    return {
      ...service,
      medicalRequestDocuments
    };
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(id);
    const updated = Object.assign(service, updateServiceDto);
    return await this.serviceRepository.save(updated);
  }

  async remove(id: number) {
    const service = await this.findOne(id);
    return await this.serviceRepository.remove(service);
  }
}
