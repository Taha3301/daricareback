import { Injectable, NotFoundException } from '@nestjs/common';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from './documents.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Professional, ProfessionalStatus } from '../professional/entities/professional.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Professional)
    private proRepository: Repository<Professional>,
  ) { }

  async create(createDocumentDto: CreateDocumentDto, filePaths: string[]) {
    const { type, professionalId, description } = createDocumentDto;

    // Normalize into arrays to handle both single and batch uploads
    const types = Array.isArray(type) ? type : [type];
    const descriptions = Array.isArray(description) ? description : [description];

    const documents = filePaths.map((filePath, index) =>
      this.documentRepository.create({
        type: types[index] || types[0] || 'Unknown',
        filePath,
        description: descriptions[index] || descriptions[0],
        professionalId: Number(professionalId),
      })
    );
    return this.documentRepository.save(documents);
  }

  async findAll() {
    return this.documentRepository.find({ relations: ['professional'] });
  }

  async findAllByProfessional(professionalId: number) {
    return this.documentRepository.find({
      where: { professionalId },
      relations: ['professional'],
    });
  }

  async findOne(id: number) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['professional'],
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto, newFilePath?: string) {
    const document = await this.findOne(id);

    if (newFilePath && document.filePath) {
      // Delete old physical file
      try {
        const oldPath = join(process.cwd(), document.filePath);
        unlinkSync(oldPath);
      } catch (error) {
        console.error(`Failed to delete old file: ${document.filePath}`, error);
      }
      document.filePath = newFilePath;
    }

    const updated = Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(updated);
  }

  async remove(id: number) {
    const document = await this.findOne(id);

    // Delete physical file
    try {
      const fullPath = join(process.cwd(), document.filePath);
      unlinkSync(fullPath);
    } catch (error) {
      console.error(`Failed to delete file: ${document.filePath}`, error);
    }

    await this.documentRepository.remove(document);
    return { message: 'Document deleted successfully' };
  }

  async toggleProfessionalDocuments(professionalId: number) {
    const documents = await this.documentRepository.find({
      where: { professionalId },
    });

    if (!documents.length) {
      throw new NotFoundException(`No documents found for professional with ID ${professionalId}`);
    }

    // Determine the target status: if any are unverified, verify all. Otherwise, unverify all.
    const anyUnverified = documents.some((doc) => !doc.verified);
    const targetStatus = anyUnverified;

    const updatedDocuments = documents.map((doc) => ({
      ...doc,
      verified: targetStatus,
    }));

    await this.documentRepository.save(updatedDocuments);

    // Update professional status
    const professional = await this.proRepository.findOne({ where: { id: professionalId } });
    if (professional) {
      if (targetStatus && professional.status === ProfessionalStatus.PENDING) {
        professional.status = ProfessionalStatus.ACCEPTED;
      } else if (!targetStatus && professional.status === ProfessionalStatus.ACCEPTED) {
        professional.status = ProfessionalStatus.PENDING;
      }
      await this.proRepository.save(professional);
    }

    return {
      message: `Successfully ${targetStatus ? 'verified' : 'unverified'} ${documents.length} documents for professional ${professionalId}. Status set to ${professional?.status}`,
      verified: targetStatus,
      professionalStatus: professional?.status,
    };
  }

  async toggleVerification(id: number) {
    const document = await this.findOne(id);
    document.verified = !document.verified;
    await this.documentRepository.save(document);
    return {
      message: `Document ${id} is now ${document.verified ? 'verified' : 'unverified'}`,
      verified: document.verified,
    };
  }

  async verifyBulk(ids: number[], verified: boolean) {
    const documents = await this.documentRepository.find({
      where: { id: In(ids) },
    });

    if (documents.length !== ids.length) {
      throw new NotFoundException('Some documents were not found');
    }

    documents.forEach(doc => doc.verified = verified);
    await this.documentRepository.save(documents);

    return {
      message: `Successfully ${verified ? 'verified' : 'unverified'} ${documents.length} documents`,
      count: documents.length,
    };
  }
}
