import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avis } from './avis.entity';
import { Patient } from '../patients/patient.entity';
import { CreateAvisDto } from './dto/create-avis.dto';
import { UpdateAvisDto } from './dto/update-avis.dto';

@Injectable()
export class AvisService {
  constructor(
    @InjectRepository(Avis)
    private readonly avisRepository: Repository<Avis>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /** Create an avis — one per patient */
  async create(dto: CreateAvisDto): Promise<Avis> {
    // 1. Verify patient identity (must provide either id or phone)
    if (!dto.patientId && !dto.phoneNumber) {
      throw new BadRequestException(
        'Vous devez fournir soit votre ID de patient, soit votre numéro de téléphone.',
      );
    }

    let patient: Patient | null = null;

    if (dto.patientId) {
      patient = await this.patientRepository.findOne({
        where: { id: dto.patientId },
      });
    } else if (dto.phoneNumber) {
      patient = await this.patientRepository.findOne({
        where: { phone: dto.phoneNumber },
      });
    }

    if (!patient) {
      const identifier = dto.patientId
        ? `#${dto.patientId}`
        : `${dto.phoneNumber}`;
      throw new NotFoundException(
        `Aucun patient trouvé avec l'identifiant ${identifier}.`,
      );
    }

    // 2. Check if avis already exists
    const existing = await this.avisRepository.findOne({
      where: { patientId: patient.id },
    });
    if (existing) {
      throw new ConflictException(
        `Un avis existe déjà pour le patient ${patient.firstname} ${patient.lastname}.`,
      );
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('La note doit être entre 1 et 5.');
    }

    const avis = this.avisRepository.create({
      ...dto,
      patientId: patient.id,
    });
    return this.avisRepository.save(avis);
  }

  /** Get all avis (optionally only approved ones) */
  async findAll(onlyApproved = false): Promise<Avis[]> {
    const where = onlyApproved ? { isApproved: true } : {};
    return this.avisRepository.find({
      where,
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Get average rating across all approved avis */
  async getAverageRating(): Promise<{ average: number; total: number }> {
    const result = await this.avisRepository
      .createQueryBuilder('avis')
      .select('AVG(avis.rating)', 'average')
      .addSelect('COUNT(avis.id)', 'total')
      .where('avis.isApproved = true')
      .getRawOne();
    return {
      average: parseFloat(parseFloat(result.average || '0').toFixed(2)),
      total: parseInt(result.total || '0', 10),
    };
  }

  /** Get avis by patient */
  async findByPatient(patientId: number): Promise<Avis> {
    const avis = await this.avisRepository.findOne({
      where: { patientId },
      relations: ['patient'],
    });
    if (!avis) {
      throw new NotFoundException(`Aucun avis trouvé pour le patient #${patientId}.`);
    }
    return avis;
  }

  /** Get single avis by id */
  async findOne(id: number): Promise<Avis> {
    const avis = await this.avisRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!avis) {
      throw new NotFoundException(`Avis #${id} introuvable.`);
    }
    return avis;
  }

  /** Update an avis */
  async update(id: number, dto: UpdateAvisDto): Promise<Avis> {
    const avis = await this.findOne(id);
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new BadRequestException('La note doit être entre 1 et 5.');
    }
    Object.assign(avis, dto);
    return this.avisRepository.save(avis);
  }

  /** Admin: approve or reject */
  async approve(id: number, approved: boolean): Promise<Avis> {
    const avis = await this.findOne(id);
    avis.isApproved = approved;
    return this.avisRepository.save(avis);
  }

  /** Delete an avis */
  async remove(id: number): Promise<void> {
    const avis = await this.findOne(id);
    await this.avisRepository.remove(avis);
  }
}
