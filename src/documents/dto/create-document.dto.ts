import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateDocumentDto {
    @ApiProperty({ example: 'CIN', description: 'Document type (e.g. CIN, Diplome). Can be an array if multiple files are uploaded.' })
    @IsNotEmpty()
    type: string | string[];

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    professionalId: number;


    @ApiProperty({ example: 'This is a description', required: false, description: 'Description. Can be an array.' })
    description?: string | string[];
}
