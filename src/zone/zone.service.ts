import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './zone.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private zoneRepository: Repository<Zone>,
  ) { }

  create(createZoneDto: CreateZoneDto) {
    const zone = this.zoneRepository.create(createZoneDto);
    return this.zoneRepository.save(zone);
  }

  findAll() {
    return this.zoneRepository.find();
  }

  findOne(id: number) {
    return this.zoneRepository.findOne({ where: { id } });
  }

  async update(id: number, updateZoneDto: UpdateZoneDto) {
    await this.zoneRepository.update(id, updateZoneDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.zoneRepository.delete(id);
  }

  async searchByPhoton(query: string) {
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&countrycode=tn&limit=5`);
      const data = await response.json();

      const results: any[] = [];
      for (const feature of (data as any).features) {
        const cityName = feature.properties.city || feature.properties.name;
        if (cityName) {
          const zone = await this.zoneRepository.findOne({
            where: { cityName: cityName }
          });

          results.push({
            name: cityName,
            zoneId: zone ? zone.id : null,
            fullAddress: [feature.properties.name, feature.properties.city, feature.properties.state].filter(Boolean).join(', '),
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            context: feature.properties
          });
        }
      }
      return results;
    } catch (error) {
      console.error('Photon API error:', error);
      return [];
    }
  }

  async reverseGeocode(lat: number, lon: number) {
    try {
      const response = await fetch(`https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`);
      const data = await response.json();

      const feature = (data as any).features?.[0];
      if (!feature) return null;

      const props = feature.properties;

      // Pure data extraction: Prioritize the most accurate administrative name
      // (City/Town/Locality) to avoid returning just a specific landmark name.
      const cityName = props.city || props.town || props.village || props.locality || props.name;

      const zone = cityName ? await this.zoneRepository.findOne({ where: { cityName } }) : null;

      return {
        name: cityName,
        zoneId: zone ? zone.id : null,
        fullAddress: [props.name !== cityName ? props.name : null, cityName, props.state].filter(Boolean).join(', '),
        lat: lat,
        lon: lon,
        context: props
      };
    } catch (error) {
      console.error('Photon Reverse Geocode error:', error);
      return null;
    }
  }

  async detectByGps(lat: number, lon: number) {
    const geoData = await this.reverseGeocode(lat, lon);
    if (!geoData) {
      throw new Error('Could not resolve locale for these coordinates');
    }
    return {
      ...geoData,
      method: 'GPS-Precision',
      coords: { lat, lon }
    };
  }

  async detectLocation(manualLat?: number, manualLon?: number) {
    try {
      // 1. Prioritize Manual GPS Inputs
      if (manualLat && manualLon) {
        return await this.detectByGps(manualLat, manualLon);
      }

      // 2. Fallback: Server-side IP Detection
      const ipRes = await fetch('http://ip-api.com/json/?fields=status,message,country,city,lat,lon,timezone,query');
      const ipData = await ipRes.json();

      if (ipData.status !== 'success') {
        throw new Error(ipData.message || 'IP-based geolocation failed');
      }

      const photonData = await this.reverseGeocode(ipData.lat, ipData.lon);
      return {
        ...photonData,
        ip_city: ipData.city,
        ip_country: ipData.country,
        method: 'Automatic-Server-IP',
        coords: { lat: ipData.lat, lon: ipData.lon }
      };
    } catch (error) {
      console.error('Location detection error:', error.message);
      return { error: 'Failed to detect location', details: error.message };
    }
  }
}
