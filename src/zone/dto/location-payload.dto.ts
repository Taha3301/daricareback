export class LocationPayloadDto {
    gps?: {
        latitude: number;
        longitude: number;
    };
    ip?: {
        ip?: string;
        latitude?: number;
        longitude?: number;
    };
}
