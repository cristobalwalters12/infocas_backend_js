import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  async findRangeInformation(@Body() informationDto: InformationDto) {
    return await this.sensoresService.findRangeInformation(informationDto);
  }

  @Post('/temperature-information')
  async findInformation(@Body() informationDto: InformationDto) {
    return await this.sensoresService.findTemperatureRange(informationDto);
  }

  @Get()
  async findAll(@Query() paginationDto: any) {
    return await this.sensoresService.findAll(paginationDto);
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
