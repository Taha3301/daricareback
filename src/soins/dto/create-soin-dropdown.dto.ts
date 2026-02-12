import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSoinDropdownDto {
    @ApiProperty({ description: 'The question name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The choices for selection', type: [String] })
    @IsArray()
    @IsString({ each: true })
    choices: string[];

    @ApiProperty({ description: 'The ID of the soin this belongs to' })
    @IsNotEmpty()
    @IsNumber()
    soinId: number;
}
