import { Controller, Post, Body, Delete, Param, UseGuards, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SoinsContentService } from './soins-content.service';
import { CreateSoinCheckboxDto } from './dto/create-soin-checkbox.dto';
import { CreateSoinRadioDto } from './dto/create-soin-radio.dto';
import { CreateSoinDropdownDto } from './dto/create-soin-dropdown.dto';
import { CreateSoinTextDto } from './dto/create-soin-text.dto';
import { UpdateSoinCheckboxDto } from './dto/update-soin-checkbox.dto';
import { UpdateSoinRadioDto } from './dto/update-soin-radio.dto';
import { UpdateSoinDropdownDto } from './dto/update-soin-dropdown.dto';
import { UpdateSoinTextDto } from './dto/update-soin-text.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Soins Content')
@ApiBearerAuth()
@Controller('soins/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SoinsContentController {
    constructor(private readonly contentService: SoinsContentService) { }

    // CHECKBOX
    @Post('checkbox')
    createCheckbox(@Body() dto: CreateSoinCheckboxDto) { return this.contentService.createCheckbox(dto); }

    @Get('checkbox')
    findAllCheckboxes() { return this.contentService.findAllCheckboxes(); }

    @Get('checkbox/:id')
    findOneCheckbox(@Param('id') id: string) { return this.contentService.findOneCheckbox(+id); }

    @Patch('checkbox/:id')
    updateCheckbox(@Param('id') id: string, @Body() dto: UpdateSoinCheckboxDto) { return this.contentService.updateCheckbox(+id, dto); }

    @Delete('checkbox/:id')
    removeCheckbox(@Param('id') id: string) { return this.contentService.removeCheckbox(+id); }

    // RADIO
    @Post('radio')
    createRadio(@Body() dto: CreateSoinRadioDto) { return this.contentService.createRadio(dto); }

    @Get('radio')
    findAllRadios() { return this.contentService.findAllRadios(); }

    @Get('radio/:id')
    findOneRadio(@Param('id') id: string) { return this.contentService.findOneRadio(+id); }

    @Patch('radio/:id')
    updateRadio(@Param('id') id: string, @Body() dto: UpdateSoinRadioDto) { return this.contentService.updateRadio(+id, dto); }

    @Delete('radio/:id')
    removeRadio(@Param('id') id: string) { return this.contentService.removeRadio(+id); }

    // DROPDOWN
    @Post('dropdown')
    createDropdown(@Body() dto: CreateSoinDropdownDto) { return this.contentService.createDropdown(dto); }

    @Get('dropdown')
    findAllDropdowns() { return this.contentService.findAllDropdowns(); }

    @Get('dropdown/:id')
    findOneDropdown(@Param('id') id: string) { return this.contentService.findOneDropdown(+id); }

    @Patch('dropdown/:id')
    updateDropdown(@Param('id') id: string, @Body() dto: UpdateSoinDropdownDto) { return this.contentService.updateDropdown(+id, dto); }

    @Delete('dropdown/:id')
    removeDropdown(@Param('id') id: string) { return this.contentService.removeDropdown(+id); }

    // TEXT
    @Post('text')
    createText(@Body() dto: CreateSoinTextDto) { return this.contentService.createText(dto); }

    @Get('text')
    findAllTexts() { return this.contentService.findAllTexts(); }

    @Get('text/:id')
    findOneText(@Param('id') id: string) { return this.contentService.findOneText(+id); }

    @Patch('text/:id')
    updateText(@Param('id') id: string, @Body() dto: UpdateSoinTextDto) { return this.contentService.updateText(+id, dto); }

    @Delete('text/:id')
    removeText(@Param('id') id: string) { return this.contentService.removeText(+id); }
}
