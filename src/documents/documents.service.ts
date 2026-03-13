import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from './documents.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Professional, ProfessionalStatus } from '../professional/entities/professional.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Professional)
    private proRepository: Repository<Professional>,
    private cloudinaryService: CloudinaryService,
  ) { }

  async create(createDocumentDto: CreateDocumentDto, files: Express.Multer.File[]) {
    const { type, professionalId, description } = createDocumentDto;

    // Normalize into arrays to handle both single and batch uploads
    const types = Array.isArray(type) ? type : [type];
    const descriptions = Array.isArray(description) ? description : [description];

    const documents = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadResult = await this.cloudinaryService.uploadFile(file, 'daricare_documents');

      const doc = this.documentRepository.create({
        type: types[i] || types[0] || 'Unknown',
        filePath: uploadResult.secure_url,
        description: descriptions[i] || descriptions[0],
        professionalId: Number(professionalId),
      });
      documents.push(doc);
    }
    
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

  async update(id: number, updateDocumentDto: UpdateDocumentDto, file?: Express.Multer.File) {
    const document = await this.findOne(id);

    if (file) {
      // Delete old file from Cloudinary
      if (document.filePath && document.filePath.includes('cloudinary.com')) {
        const publicIdMatch = document.filePath.match(/\/v\d+\/daricare_documents\/([^\.]+)/);
        if (publicIdMatch && publicIdMatch[1]) {
           try {
             await this.cloudinaryService.deleteFile(`daricare_documents/${publicIdMatch[1]}`);
           } catch (err) {
             console.error(`Failed to delete old document from Cloudinary`, err);
           }
        }
      }
      
      const uploadResult = await this.cloudinaryService.uploadFile(file, 'daricare_documents');
      document.filePath = uploadResult.secure_url;
    }

    const updated = Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(updated);
  }

  async remove(id: number) {
    const document = await this.findOne(id);

    // Delete file from Cloudinary
    if (document.filePath && document.filePath.includes('cloudinary.com')) {
      const publicIdMatch = document.filePath.match(/\/v\d+\/daricare_documents\/([^\.]+)/);
      if (publicIdMatch && publicIdMatch[1]) {
         try {
           await this.cloudinaryService.deleteFile(`daricare_documents/${publicIdMatch[1]}`);
         } catch (err) {
           console.error(`Failed to delete document from Cloudinary`, err);
         }
      }
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
