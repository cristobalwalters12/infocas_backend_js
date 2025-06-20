import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { ControladoresService } from './controladores.service';
import { CreateControladoreDto } from './dto/create-controladore.dto';
import { FindControladoreDto } from './dto/find-controladore.dto';
import { FindRespaldoControladoresDto } from './dto/find-respaldo-Controladores.dto';
import { DownloadControladorDto } from './dto/download-controlador.dto';
import { FindArchivoRespaldoControladoresDto } from './dto/find-archivo-Controladores.dto';
import { DownloadGatewayDto } from './dto/dowload-gateway.dto';
import { Response } from 'express';
@Controller('controladores')
export class ControladoresController {
  constructor(private readonly controladoresService: ControladoresService) {}

  @Post()
  create(@Body() createControladoreDto: CreateControladoreDto) {
    return this.controladoresService.create(createControladoreDto);
  }

  @Get()
  findAll() {
    return this.controladoresService.findAll();
  }
  @Post('/getControladoresRespaldos')
  getControladoresRespaldos(
    @Body() findRespaldoControladoresDto: FindRespaldoControladoresDto,
  ) {
    return this.controladoresService.getControladoresRespaldos(
      findRespaldoControladoresDto,
    );
  }

  @Post('/findArchivoControlador')
  findArchivoControlador(
    @Body()
    findArchivoRespaldoControladoresDto: FindArchivoRespaldoControladoresDto,
  ) {
    return this.controladoresService.getArchivosControlador(
      findArchivoRespaldoControladoresDto,
    );
  }

  @Post('/findControladorAndRespaldar')
  findOne(@Body() findControladoreDto: FindControladoreDto) {
    return this.controladoresService.respaldarTxt(findControladoreDto);
  }
  @Post('/descargarRespaldo')
  async descargarRespaldo(
    @Body() downloadControladorDto: DownloadControladorDto,
    @Res() res: Response,
  ) {
    return this.controladoresService.descargarRespaldo(
      downloadControladorDto,
      res,
    );
  }
  @Post('/downloadGateway')
  async downloadGateway(
    @Body() downloadGatewayDto: DownloadGatewayDto,
    @Res() res: Response,
  ) {
    return this.controladoresService.descargarRespaldoGateway(
      downloadGatewayDto,
      res,
    );
  }

  @Post('/respaldarSensores2024')
  async respaldarSensores2024(
    @Body() findControladoreDto: FindControladoreDto,
  ) {
    return this.controladoresService.respaldo_Sensores2025(findControladoreDto);
  }
  @Post('/test')
  async test() {
    return this.controladoresService.test();
  }
}
