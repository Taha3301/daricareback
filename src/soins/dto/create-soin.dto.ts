import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSoinDto {
  @ApiProperty({ description: 'The name of the soin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the soin' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The ID of the service this soin belongs to' })
  @IsNotEmpty()
  @IsNumber()
  serviceId: number;

  @ApiProperty({ description: 'The price of the soin', default: 0 })
  @IsNumber()
  @IsOptional()
  price?: number;
}
