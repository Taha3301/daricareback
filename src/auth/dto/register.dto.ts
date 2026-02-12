import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'admin@test.com' })
    email: string;

    @ApiProperty({ example: 'password123' })
    password: string;

    @ApiProperty({ example: 'Admin User', required: false })
    name?: string;

    @ApiProperty({ required: false })
    speciality?: string;

    @ApiProperty({ required: false })
    yearsOfExperience?: number;

    @ApiProperty({ required: false })
    adeliRppsNumber?: string;

    @ApiProperty({ required: false })
    professionalPhone?: string;

    @ApiProperty({ required: false })
    professionalAddress?: string;

    @ApiProperty({ required: false })
    city?: string;


    @ApiProperty({ required: false })
    latitude?: number;

    @ApiProperty({ required: false })
    longitude?: number;
}
