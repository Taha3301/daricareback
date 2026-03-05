import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Gender } from '../user.entity';

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe' })
    name: string;

    @ApiProperty({ enum: Gender, example: Gender.MALE, required: false })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiProperty({ example: 'john@example.com' })
    email: string;

    @ApiProperty({ example: '+1234567890' })
    phone: string;

    @ApiProperty({ example: 'password123' })
    password: string;
}
