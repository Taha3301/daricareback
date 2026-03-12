import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateAvisDto {
  @ApiProperty({ description: 'Note de 1 à 5 étoiles', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Commentaire (optionnel)', required: false, example: 'Excellent service !' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiProperty({ description: 'Titre court de l\'avis (optionnel)', required: false, example: 'Très satisfait' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: 'Recommanderiez-vous ce service ?', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  wouldRecommend?: boolean;

  @ApiProperty({ description: 'ID du patient (optionnel si numéro fourni)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  patientId?: number;

  @ApiProperty({ description: 'Numéro de téléphone du patient (optionnel si ID fourni)', example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
