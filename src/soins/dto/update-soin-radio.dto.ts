import { PartialType } from '@nestjs/swagger';
import { CreateSoinRadioDto } from './create-soin-radio.dto';

export class UpdateSoinRadioDto extends PartialType(CreateSoinRadioDto) { }
