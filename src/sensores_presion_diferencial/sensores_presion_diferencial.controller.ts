import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SensoresPresionDiferencialService } from './sensores_presion_diferencial.service';
import { CreateSensoresPresionDiferencialDto } from './dto/create-sensores_presion_diferencial.dto';
import { UpdateSensoresPresionDiferencialDto } from './dto/update-sensores_presion_diferencial.dto';
import { InformationDiferencialDto } from './dto/information-prediff-dto';

@Controller('sensores_presion_diferencial')
export class SensoresPresionDiferencialController {
  constructor(
    private readonly sensoresPresionDiferencialService: SensoresPresionDiferencialService,
  ) {}

  @Post()
  create(
    @Body()
    createSensoresPresionDiferencialDto: CreateSensoresPresionDiferencialDto,
  ) {
    return this.sensoresPresionDiferencialService.create(
      createSensoresPresionDiferencialDto,
    );
  }
  @Post('/range-information-pressure-differential')
  async findRangeInformationPressureDifferential(
    @Body() informationDto: InformationDiferencialDto,
  ) {
    return await this.sensoresPresionDiferencialService.findRangeInformationPressureDifferential(
      informationDto,
    );
  }
  @Post('/pressure-differential-range')
  async findPressureDifferentialRange(
    @Body() informationDto: InformationDiferencialDto,
  ) {
    return await this.sensoresPresionDiferencialService.findPressureDifferentialRange(
      informationDto,
    );
  }

  @Get()
  findAll() {
    return this.sensoresPresionDiferencialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensoresPresionDiferencialService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateSensoresPresionDiferencialDto: UpdateSensoresPresionDiferencialDto,
  ) {
    return this.sensoresPresionDiferencialService.update(
      +id,
      updateSensoresPresionDiferencialDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sensoresPresionDiferencialService.remove(+id);
  }
}
