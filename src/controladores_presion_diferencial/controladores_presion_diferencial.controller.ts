import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ControladoresPresionDiferencialService } from './controladores_presion_diferencial.service';
import { CreateControladoresPresionDiferencialDto } from './dto/create-controladores_presion_diferencial.dto';
import { FindRespaldoControladoresPreDifDto } from './dto/find-respaldo-controladores-predif.dto';
import { FindArchivoRespaldoControladoresPreDifDto } from './dto/find-archivo-controladores-predif.dto';
import { FindControladorePreDifDto } from './dto/find-controladores-predif.dto';
@Controller('/controladores_presion_diferencial')
export class ControladoresPresionDiferencialController {
  constructor(
    private readonly controladoresPresionDiferencialService: ControladoresPresionDiferencialService,
  ) {}

  @Post()
  create(
    @Body()
    createControladoresPresionDiferencialDto: CreateControladoresPresionDiferencialDto,
  ) {
    return this.controladoresPresionDiferencialService.create(
      createControladoresPresionDiferencialDto,
    );
  }

  @Post('/getControladoresRespaldo')
  getControladoresRespaldo(
    @Body()
    findRespaldoControladoresPreDifDto: FindRespaldoControladoresPreDifDto,
  ) {
    return this.controladoresPresionDiferencialService.getControladoresRespaldoPreDif(
      findRespaldoControladoresPreDifDto,
    );
  }

  @Post('/getArchivosControlador')
  getArchivosControlador(
    @Body()
    findArchivoRespaldoControladoresPreDifDto: FindArchivoRespaldoControladoresPreDifDto,
  ) {
    return this.controladoresPresionDiferencialService.getArchivosControlador(
      findArchivoRespaldoControladoresPreDifDto,
    );
  }

  @Post('/respaldarSensoresPreDif')
  respaldoSensoresPreDif(
    @Body()
    findControladorePreDifDto: FindControladorePreDifDto,
  ) {
    return this.controladoresPresionDiferencialService.respaldoSensoresPreDif(
      findControladorePreDifDto,
    );
  }

  @Get()
  findAll() {
    return this.controladoresPresionDiferencialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controladoresPresionDiferencialService.findOne(+id);
  }
}
