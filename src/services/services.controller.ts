import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SoinsService } from '../soins/soins.service';
import { CreateSoinDto } from '../soins/dto/create-soin.dto';
import { Public } from '../auth/public.decorator';

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
  @ApiBearerAuth()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
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
  findAllOnly() {
    return this.servicesService.findAllOnly();
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
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
