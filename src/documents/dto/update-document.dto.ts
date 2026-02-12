import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateDocumentDto } from './create-document.dto';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
    @ApiProperty({ example: true, required: false })
    verified?: boolean;
}
