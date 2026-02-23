import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateWhatsappDto {
    @ApiProperty({ description: 'The WhatsApp status to set (true or false)' })
    @IsBoolean()
    whatsapp: boolean;
}
