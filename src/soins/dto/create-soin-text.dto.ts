import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSoinTextDto {
    @ApiProperty({ description: 'The question name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The ID of the soin this belongs to' })
    @IsNotEmpty()
    @IsNumber()
    soinId: number;
}
