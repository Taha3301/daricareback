import { PartialType } from '@nestjs/swagger';
import { CreateSoinTextDto } from './create-soin-text.dto';

export class UpdateSoinTextDto extends PartialType(CreateSoinTextDto) { }
