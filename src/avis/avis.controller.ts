import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AvisService } from './avis.service';
import { CreateAvisDto } from './dto/create-avis.dto';
import { UpdateAvisDto } from './dto/update-avis.dto';
import { Avis } from './avis.entity';

@ApiTags('avis')
@Controller('avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un avis pour un patient (1 avis par patient)' })
  @ApiResponse({ status: 201, type: Avis })
  create(@Body() dto: CreateAvisDto) {
    return this.avisService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les avis' })
  @ApiQuery({ name: 'onlyApproved', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [Avis] })
  findAll(
    @Query('onlyApproved', new DefaultValuePipe(false), ParseBoolPipe)
    onlyApproved: boolean,
  ) {
    return this.avisService.findAll(onlyApproved);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir la note moyenne et le nombre d\'avis approuvés' })
  getStats() {
    return this.avisService.getAverageRating();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obtenir l\'avis d\'un patient' })
  @ApiResponse({ status: 200, type: Avis })
  findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.avisService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un avis par son ID' })
  @ApiResponse({ status: 200, type: Avis })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.avisService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un avis' })
  @ApiResponse({ status: 200, type: Avis })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvisDto,
  ) {
    return this.avisService.update(id, dto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approuver ou rejeter un avis (admin)' })
  @ApiQuery({ name: 'approved', required: true, type: Boolean })
  @ApiResponse({ status: 200, type: Avis })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Query('approved', ParseBoolPipe) approved: boolean,
  ) {
    return this.avisService.approve(id, approved);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un avis' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.avisService.remove(id);
  }
}
