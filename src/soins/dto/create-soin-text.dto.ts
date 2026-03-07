import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSoinTextDto {
    @ApiProperty({ description: 'The question name' })
    @IsNotEmpty()
    @IsString()
    name: string;


    @ApiProperty({ description: 'The question name in Arabic', required: false })
    @IsOptional()
    @IsString()
    name_ar?: string;

    @ApiProperty({ description: 'The choices for selection in Arabic', type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    choices_ar?: string[];

    @ApiProperty({ description: 'The ID of the soin this belongs to' })
    @IsNotEmpty()
    @IsNumber()
    soinId: number;
}
