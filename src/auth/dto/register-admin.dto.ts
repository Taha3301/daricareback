import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Gender } from '../../user/user.entity';

export class RegisterAdminDto {
    @ApiProperty({ example: 'Admin User' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @ApiProperty({ enum: Gender, example: Gender.MALE, required: false })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiProperty({ example: 'admin@test.com' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}
