import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HistorialPresionDiferencialService } from './historial_presion_diferencial.service';
import { CreateHistorialPresionDiferencialDto } from './dto/create-historial_presion_diferencial.dto';
import { UpdateHistorialPresionDiferencialDto } from './dto/update-historial_presion_diferencial.dto';

@Controller('historial-presion-diferencial')
export class HistorialPresionDiferencialController {
  constructor(
    private readonly historialPresionDiferencialService: HistorialPresionDiferencialService,
  ) {}

  @Post()
  create(
    @Body()
    createHistorialPresionDiferencialDto: CreateHistorialPresionDiferencialDto,
  ) {
    return this.historialPresionDiferencialService.create(
      createHistorialPresionDiferencialDto,
    );
  }

  @Get()
  findAll() {
    return this.historialPresionDiferencialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialPresionDiferencialService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateHistorialPresionDiferencialDto: UpdateHistorialPresionDiferencialDto,
  ) {
    return this.historialPresionDiferencialService.update(
      +id,
      updateHistorialPresionDiferencialDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialPresionDiferencialService.remove(+id);
  }
}
