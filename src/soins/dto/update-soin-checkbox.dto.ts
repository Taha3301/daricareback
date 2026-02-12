import { PartialType } from '@nestjs/swagger';
import { CreateSoinCheckboxDto } from './create-soin-checkbox.dto';

export class UpdateSoinCheckboxDto extends PartialType(CreateSoinCheckboxDto) { }
