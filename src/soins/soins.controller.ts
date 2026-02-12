import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SoinsService } from './soins.service';
import { CreateSoinDto } from './dto/create-soin.dto';
import { UpdateSoinDto } from './dto/update-soin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Soins')
@ApiBearerAuth()
@Controller('soins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SoinsController {
  constructor(private readonly soinsService: SoinsService) { }

  @Post()
  create(@Body() createSoinDto: CreateSoinDto) {
    return this.soinsService.create(createSoinDto);
  }

  @Get()
  findAll() {
    return this.soinsService.findAll();
  }

  @Get('service/:serviceId')
  findByService(@Param('serviceId') serviceId: string) {
    return this.soinsService.findByServiceId(+serviceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soinsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSoinDto: UpdateSoinDto) {
    return this.soinsService.update(+id, updateSoinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.soinsService.remove(+id);
  }
}
