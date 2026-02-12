import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, UseGuards
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Ensure upload directory exists
const uploadDir = './uploads/documents';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post()
  @ApiOperation({ summary: 'Upload a document (PDF or Image)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ]
        },
        description: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ]
        },
        professionalId: { type: 'number' },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return callback(new BadRequestException('Only images and PDFs are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createDocumentDto: CreateDocumentDto
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }
    // Save the relative paths in the database
    const filePaths = files.map(file => `uploads/documents/${file.filename}`);
    return this.documentsService.create(createDocumentDto, filePaths);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all documents (Admin only)' })
  findAll() {
    return this.documentsService.findAll();
  }

  @Get('professional/:professionalId')
  @ApiOperation({ summary: 'Get all documents for a professional' })
  findAllByProfessional(@Param('professionalId') professionalId: string) {
    return this.documentsService.findAllByProfessional(+professionalId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document record (including file replacement)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        professionalId: { type: 'number' },
        description: { type: 'string' },
        verified: { type: 'boolean' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return callback(new BadRequestException('Only images and PDFs are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const newFilePath = file ? `uploads/documents/${file.filename}` : undefined;
    return this.documentsService.update(+id, updateDocumentDto, newFilePath);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a document (Admin only)' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(+id);
  }

  @Patch('professional/:professionalId/verify')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Verify or unverify all documents for a professional (Admin only)' })
  toggleVerifyBatch(@Param('professionalId') professionalId: string) {
    return this.documentsService.toggleProfessionalDocuments(+professionalId);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Verify or unverify a specific document (Admin only)' })
  toggleVerifyOne(@Param('id') id: string) {
    return this.documentsService.toggleVerification(+id);
  }

  @Patch('bulk/verify')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Verify or unverify multiple documents (Admin only)' })
  verifyBulk(@Body('ids') ids: number[], @Body('verified') verified: boolean) {
    return this.documentsService.verifyBulk(ids, verified);
  }
}
