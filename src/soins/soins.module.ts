import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoinsService } from './soins.service';
import { SoinsController } from './soins.controller';
import { Soin } from './soins.entity';
import { SoinCheckbox } from './entities/checkbox.entity';
import { SoinRadio } from './entities/radio.entity';
import { SoinDropdown } from './entities/dropdown.entity';
import { SoinText } from './entities/text.entity';
import { SoinsContentService } from './soins-content.service';
import { SoinsContentController } from './soins-content.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Soin,
      SoinCheckbox,
      SoinRadio,
      SoinDropdown,
      SoinText
    ])
  ],
  controllers: [SoinsController, SoinsContentController],
  providers: [SoinsService, SoinsContentService],
  exports: [TypeOrmModule, SoinsService, SoinsContentService],
})
export class SoinsModule { }
