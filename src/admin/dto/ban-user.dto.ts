import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BanUserDto {
    @ApiProperty({
        example: true,
        description: 'Set to true to ban the user, false to unban'
    })
    @IsBoolean()
    ban: boolean;
}
