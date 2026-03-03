import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateSuperadminDto {
    @ApiProperty({ description: 'The superadmin status of the user' })
    @IsBoolean()
    superadmin: boolean;
}
