import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
    @ApiProperty({ example: 1 })
    professionalId: number;

    @ApiProperty({ example: [1, 2], type: [Number] })
    documentIds: number[];

    @ApiProperty({ example: 'Please re-verify your CIN and Diploma documents.' })
    comment: string;

    @ApiProperty({ example: false, required: false })
    update?: boolean;
}
