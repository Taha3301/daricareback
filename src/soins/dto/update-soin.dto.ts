import { PartialType } from '@nestjs/swagger';
import { CreateSoinDto } from './create-soin.dto';

export class UpdateSoinDto extends PartialType(CreateSoinDto) { }
