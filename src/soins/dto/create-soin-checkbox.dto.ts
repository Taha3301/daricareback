import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSoinCheckboxDto {
    @ApiProperty({ description: 'The question name' })
    @IsNotEmpty()
    @IsString()
    name: string;


    @ApiProperty({ description: 'The question name in Arabic', required: false })
    @IsOptional()
    @IsString()
    name_ar?: string;

    @ApiProperty({ description: 'The choices for selection', type: [String] })
    @IsArray()
    @IsString({ each: true })
    choices: string[];

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
