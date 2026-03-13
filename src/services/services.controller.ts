import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SoinsService } from '../soins/soins.service';
import { CreateSoinDto } from '../soins/dto/create-soin.dto';
import { Public } from '../auth/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = join(process.cwd(), 'uploads', 's');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly soinsService: SoinsService,
  ) { }

  @Post()
  @Public()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new service with an image' })
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return callback(new Error('Only images are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  create(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const imagePath = file ? `uploads/s/${file.filename}` : undefined;
    return this.servicesService.create(createServiceDto, imagePath);
  }

  @Post(':id/soins')
  @ApiBearerAuth()
  createSoin(@Param('id') id: string, @Body() createSoinDto: CreateSoinDto) {
    createSoinDto.serviceId = +id;
    return this.soinsService.create(createSoinDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('only')
  @Public()
  async findAllOnly() {
    console.log('Hitting /services/only endpoint');
    try {
      const result = await this.servicesService.findAllOnly();
      console.log('Got result from service:');
      try {
        console.log(JSON.stringify(result).substring(0, 100)); // Log part of it
      } catch (e) {
        console.error('Serialization check failed:', e);
      }
      return result;
    } catch (error) {
      console.error('Error in /services/only:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Get('professional/my-content')
  @ApiBearerAuth()
  @Roles('professional', 'admin')
  findByProfessionalSpeciality(@Req() req: any) {
    return this.servicesService.findByProfessionalSpeciality(req.user.userId);
  }

  @Patch(':id')
  @Public()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a service and its image' })
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return callback(new Error('Only images are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const imagePath = file ? `uploads/s/${file.filename}` : undefined;
    return this.servicesService.update(+id, updateServiceDto, imagePath);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
