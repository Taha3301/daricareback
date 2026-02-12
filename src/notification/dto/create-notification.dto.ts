import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty({ example: 'Service Name' })
    @IsString()
    type: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    reference_id?: number;

    @ApiProperty({ example: 'Your profile has been validated.' })
    @IsString()
    message: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    is_read?: boolean;
}
