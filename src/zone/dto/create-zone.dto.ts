import { ApiProperty } from '@nestjs/swagger';

export class CreateZoneDto {
    @ApiProperty({ example: 'Tunis' })
    cityName: string;
}
