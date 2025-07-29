import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { NombreSensoresPresionDiferencialService } from './nombre_sensores_presion_diferencial.service';
import { CreateNombreSensoresPresionDiferencialDto } from './dto/create-nombre_sensores_presion_diferencial.dto';
import { UpdateNombreSensoresPresionDiferencialDto } from './dto/update-nombre_sensores_presion_diferencial.dto';

@Controller('nombre_sensores_presion_diferencial')
export class NombreSensoresPresionDiferencialController {
  constructor(
    private readonly nombreSensoresPresionDiferencialService: NombreSensoresPresionDiferencialService,
  ) {}

  @Get('/idspresiondiferencialPosibles')
  findIds() {
    return this.nombreSensoresPresionDiferencialService.findIds();
  }

  @Post()
  create(
    @Body()
    createNombreSensoresPresionDiferencialDto: CreateNombreSensoresPresionDiferencialDto,
  ) {
    return this.nombreSensoresPresionDiferencialService.create(
      createNombreSensoresPresionDiferencialDto,
    );
  }

  @Post('/sensoresControladorPresionDiferencial')
  FindSensoresControlador(@Body() body: { id: number }) {
    const id = body.id;
    console.log(id);
    return this.nombreSensoresPresionDiferencialService.findsensoresBycontrolador(
      id,
    );
  }

  @Get('')
  findAll() {
    return this.nombreSensoresPresionDiferencialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nombreSensoresPresionDiferencialService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateNombreSensoresPresionDiferencialDto: UpdateNombreSensoresPresionDiferencialDto,
  ) {
    return this.nombreSensoresPresionDiferencialService.update(
      +id,
      updateNombreSensoresPresionDiferencialDto,
    );
  }
}
