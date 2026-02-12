import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ description: 'The reset token received via email' })
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty({ example: 'new_password123', description: 'The new password for the account' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}
