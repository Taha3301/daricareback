import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({ example: '12345678', required: false })
    phone?: string;

    @ApiProperty({ example: 'Cardiology', required: false })
    speciality?: string;

    @ApiProperty({ example: '12345678', required: false })
    cin?: string;

    @ApiProperty({ example: 'MD', required: false })
    diploma?: string;

    @ApiProperty({ example: 'LIC-123', required: false })
    license?: string;

    @ApiProperty({ example: 0, required: false })
    yearsOfExperience?: number;

    @ApiProperty({ example: '123456789', required: false })
    adeliRppsNumber?: string;

    @ApiProperty({ example: '06 00 00 00 00', required: false })
    professionalPhone?: string;

    @ApiProperty({ example: '12 rue de la Paix', required: false })
    professionalAddress?: string;

    @ApiProperty({ example: 'Paris', required: false })
    city?: string;


    @ApiProperty({ required: false })
    latitude?: number;

    @ApiProperty({ required: false })
    longitude?: number;
}
