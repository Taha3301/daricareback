import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './services.entity';
import { Professional } from '../professional/entities/professional.entity';
import { RequestDocument } from '../bookings/entities/request-document.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(RequestDocument)
    private readonly requestDocumentRepository: Repository<RequestDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(createServiceDto: CreateServiceDto, file?: Express.Multer.File) {
    let imagePath = undefined;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file, 'daricare_services');
      imagePath = uploadResult.secure_url;
    }

    const service = this.serviceRepository.create({
      ...createServiceDto,
      image: imagePath,
    });
    return await this.serviceRepository.save(service);
  }

  async findAll() {
    const services = await this.serviceRepository.find({
      relations: [
        'soins',
        'soins.checkboxes',
        'soins.radios',
        'soins.dropdowns',
        'soins.texts'
      ]
    });
    return services.map(s => this.mapServiceImage(s));
  }

  async findAllOnly() {
    const services = await this.serviceRepository.find();
    return services.map(s => this.mapServiceImage(s));
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
    return this.mapServiceImage(service);
  }

  async findByName(name: string) {
    const service = await this.serviceRepository.findOne({
      where: [
        { name },
        { name_ar: name }
      ],
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
    return this.mapServiceImage(service);
  }

  async findByProfessionalSpeciality(userId: number) {
    const professional = await this.professionalRepository.findOne({
      where: { id: userId },
    });

    if (!professional) {
      throw new NotFoundException(`Professional with ID ${userId} not found`);
    }

    const service = await this.serviceRepository.findOne({
      where: [
        { name: professional.speciality },
        { name_ar: professional.speciality }
      ],
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
      ...this.mapServiceImage(service),
      medicalRequestDocuments
    };
  }

  async update(id: number, updateServiceDto: UpdateServiceDto, file?: Express.Multer.File) {
    const service = await this.findOne(id);
    let imagePath = service.image;

    if (file) {
      // Delete old image if it exists on Cloudinary
      if (service.image && service.image.includes('cloudinary.com')) {
        const publicIdMatch = service.image.match(/\/v\d+\/daricare_services\/([^\.]+)/);
        if (publicIdMatch && publicIdMatch[1]) {
           try {
             await this.cloudinaryService.deleteFile(`daricare_services/${publicIdMatch[1]}`);
           } catch (err) {
             console.error(`Failed to delete old service image from Cloudinary`, err);
           }
        }
      }

      // Upload new image
      const uploadResult = await this.cloudinaryService.uploadFile(file, 'daricare_services');
      imagePath = uploadResult.secure_url;
    }

    const updated = Object.assign(service, {
      ...updateServiceDto,
      image: imagePath,
    });
    return await this.serviceRepository.save(updated);
  }

  async remove(id: number) {
    const service = await this.findOne(id);
    return await this.serviceRepository.remove(service);
  }

  private mapServiceImage(service: Service) {
    if (!service) return service;
    return {
      ...service,
      image: service.image?.replace('uploads/services/', 'uploads/s/')
    };
  }
}
