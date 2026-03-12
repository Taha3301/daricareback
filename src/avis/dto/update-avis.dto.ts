import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsBoolean, IsString, MaxLength, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateAvisDto } from './create-avis.dto';

export class UpdateAvisDto extends PartialType(CreateAvisDto) {}
