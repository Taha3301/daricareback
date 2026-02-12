import { PartialType } from '@nestjs/swagger';
import { CreateSoinDropdownDto } from './create-soin-dropdown.dto';

export class UpdateSoinDropdownDto extends PartialType(CreateSoinDropdownDto) { }
