import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SensoresService } from './sensores.service';
import {
  CreateSensoreDto,
  UpdateSensoreDto,
  InformationDto,
} from './dto/index';

@Controller('sensores')
export class SensoresController {
  constructor(private readonly sensoresService: SensoresService) {}

  @Post()
  create(@Body() createSensoreDto: CreateSensoreDto) {
    return this.sensoresService.create(createSensoreDto);
  }

  @Post('/range-information')
  findRangeInformation(@Body() informationDto: InformationDto) {
    return this.sensoresService.findRangeInformation(informationDto);
  }

  @Get()
  findAll() {
    return this.sensoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSensoreDto: UpdateSensoreDto) {
    return this.sensoresService.update(+id, updateSensoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sensoresService.remove(+id);
  }
}
