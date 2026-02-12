import { Controller, Get, Query } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Zones')
@Controller('zone')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) { }

  @Get('detect')
  @ApiOperation({ summary: 'Automatically detect exact locale (Zero-Input Auto-IP or Manual lat/lon Precision)' })
  detect(@Query('lat') lat?: number, @Query('lon') lon?: number) {
    return this.zoneService.detectLocation(lat, lon);
  }
}
