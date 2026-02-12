import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoinCheckbox } from './entities/checkbox.entity';
import { SoinRadio } from './entities/radio.entity';
import { SoinDropdown } from './entities/dropdown.entity';
import { SoinText } from './entities/text.entity';
import { CreateSoinCheckboxDto } from './dto/create-soin-checkbox.dto';
import { CreateSoinRadioDto } from './dto/create-soin-radio.dto';
import { CreateSoinDropdownDto } from './dto/create-soin-dropdown.dto';
import { CreateSoinTextDto } from './dto/create-soin-text.dto';
import { UpdateSoinCheckboxDto } from './dto/update-soin-checkbox.dto';
import { UpdateSoinRadioDto } from './dto/update-soin-radio.dto';
import { UpdateSoinDropdownDto } from './dto/update-soin-dropdown.dto';
import { UpdateSoinTextDto } from './dto/update-soin-text.dto';

@Injectable()
export class SoinsContentService {
    constructor(
        @InjectRepository(SoinCheckbox)
        private readonly checkboxRepository: Repository<SoinCheckbox>,
        @InjectRepository(SoinRadio)
        private readonly radioRepository: Repository<SoinRadio>,
        @InjectRepository(SoinDropdown)
        private readonly dropdownRepository: Repository<SoinDropdown>,
        @InjectRepository(SoinText)
        private readonly textRepository: Repository<SoinText>,
    ) { }

    // CHECKBOX
    async createCheckbox(dto: CreateSoinCheckboxDto) {
        const item = this.checkboxRepository.create(dto);
        return await this.checkboxRepository.save(item);
    }
    async findAllCheckboxes() { return await this.checkboxRepository.find(); }
    async findOneCheckbox(id: number) {
        const item = await this.checkboxRepository.findOne({ where: { id } });
        if (!item) throw new NotFoundException(`Checkbox with ID ${id} not found`);
        return item;
    }
    async updateCheckbox(id: number, dto: UpdateSoinCheckboxDto) {
        const item = await this.findOneCheckbox(id);
        Object.assign(item, dto);
        return await this.checkboxRepository.save(item);
    }
    async removeCheckbox(id: number) {
        const item = await this.findOneCheckbox(id);
        return await this.checkboxRepository.remove(item);
    }

    // RADIO
    async createRadio(dto: CreateSoinRadioDto) {
        const item = this.radioRepository.create(dto);
        return await this.radioRepository.save(item);
    }
    async findAllRadios() { return await this.radioRepository.find(); }
    async findOneRadio(id: number) {
        const item = await this.radioRepository.findOne({ where: { id } });
        if (!item) throw new NotFoundException(`Radio with ID ${id} not found`);
        return item;
    }
    async updateRadio(id: number, dto: UpdateSoinRadioDto) {
        const item = await this.findOneRadio(id);
        Object.assign(item, dto);
        return await this.radioRepository.save(item);
    }
    async removeRadio(id: number) {
        const item = await this.findOneRadio(id);
        return await this.radioRepository.remove(item);
    }

    // DROPDOWN
    async createDropdown(dto: CreateSoinDropdownDto) {
        const item = this.dropdownRepository.create(dto);
        return await this.dropdownRepository.save(item);
    }
    async findAllDropdowns() { return await this.dropdownRepository.find(); }
    async findOneDropdown(id: number) {
        const item = await this.dropdownRepository.findOne({ where: { id } });
        if (!item) throw new NotFoundException(`Dropdown with ID ${id} not found`);
        return item;
    }
    async updateDropdown(id: number, dto: UpdateSoinDropdownDto) {
        const item = await this.findOneDropdown(id);
        Object.assign(item, dto);
        return await this.dropdownRepository.save(item);
    }
    async removeDropdown(id: number) {
        const item = await this.findOneDropdown(id);
        return await this.dropdownRepository.remove(item);
    }

    // TEXT
    async createText(dto: CreateSoinTextDto) {
        const item = this.textRepository.create(dto);
        return await this.textRepository.save(item);
    }
    async findAllTexts() { return await this.textRepository.find(); }
    async findOneText(id: number) {
        const item = await this.textRepository.findOne({ where: { id } });
        if (!item) throw new NotFoundException(`Text with ID ${id} not found`);
        return item;
    }
    async updateText(id: number, dto: UpdateSoinTextDto) {
        const item = await this.findOneText(id);
        Object.assign(item, dto);
        return await this.textRepository.save(item);
    }
    async removeText(id: number) {
        const item = await this.findOneText(id);
        return await this.textRepository.remove(item);
    }
}
