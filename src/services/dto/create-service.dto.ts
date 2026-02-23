import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
    @ApiProperty({ description: 'The name of the service' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The description of the service' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ description: 'The image of the service', required: false, type: 'string', format: 'binary' })
    image?: any;
}
