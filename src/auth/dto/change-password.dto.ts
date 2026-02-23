import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ description: 'The current password of the user' })
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({ description: 'The new password to set' })
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
