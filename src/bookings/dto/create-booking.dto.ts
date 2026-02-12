import { IsEnum, IsString, IsNotEmpty, IsDateString, IsEmail, IsBoolean, IsNumber, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientCivility, PrescriptionStatus } from '../entities/medical-request.entity';
import { VisitType } from '../entities/request-soin.entity';

export class RequestSoinDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    soinId: number;

    @ApiPropertyOptional({ example: { detail: 'value' } })
    @IsOptional()
    answers: any;

    @ApiProperty({ enum: VisitType, example: VisitType.ONCE })
    @IsEnum(VisitType)
    @IsNotEmpty()
    visitType: VisitType;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    frequencyCount?: number;

    @ApiPropertyOptional({ example: 'day' })
    @IsOptional()
    @IsString()
    frequencyPeriod?: string;
}

export class CreateBookingDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    serviceId: number;

    @ApiProperty({ enum: PatientCivility, example: PatientCivility.M })
    @IsEnum(PatientCivility)
    @IsNotEmpty()
    patientCivility: PatientCivility;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    patientFirstname: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    patientLastname: string;

    @ApiProperty({ example: '1990-01-01' })
    @IsDateString()
    @IsNotEmpty()
    patientBirthdate: string;

    @ApiProperty({ example: '0601020304' })
    @IsString()
    @IsNotEmpty()
    patientPhone: string;

    @ApiPropertyOptional({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsOptional()
    patientEmail?: string;

    @ApiProperty({ example: '123 Rue de Paris' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiPropertyOptional({ example: 'Appartement 4B' })
    @IsString()
    @IsOptional()
    addressComplement?: string;

    @ApiPropertyOptional({ example: false })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isIndifferent?: boolean;

    @ApiPropertyOptional({ example: 48.8566 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    latitude?: number;

    @ApiPropertyOptional({ example: 2.3522 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    longitude?: number;

    @ApiProperty({ example: '2026-02-01' })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({ example: 'fixed' })
    @IsString()
    @IsNotEmpty()
    durationMode: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    durationValue: number;

    @ApiProperty({ example: '08:00' })
    @IsString()
    @IsNotEmpty()
    availabilityStart: string;

    @ApiProperty({ example: '11:00' })
    @IsString()
    @IsNotEmpty()
    availabilityEnd: string;

    @ApiProperty({ enum: PrescriptionStatus, example: PrescriptionStatus.AVAILABLE })
    @IsEnum(PrescriptionStatus)
    @IsOptional()
    prescriptionStatus: PrescriptionStatus;

    @ApiProperty({ type: [RequestSoinDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RequestSoinDto)
    @Transform(({ value }) => {
        let parsed = value;
        if (typeof value === 'string') {
            try {
                parsed = JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
        return Array.isArray(parsed) ? parsed : [parsed];
    })
    soins: RequestSoinDto[];

    @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Up to 6 prescription files (PDF, JPG, PNG)' })
    prescriptions: any[];
}
