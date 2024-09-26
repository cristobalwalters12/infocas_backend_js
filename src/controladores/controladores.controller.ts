import { Controller, Get, Post, Body } from '@nestjs/common';
import { ControladoresService } from './controladores.service';
import { CreateControladoreDto } from './dto/create-controladore.dto';
import { FindControladoreDto } from './dto/find-controladore.dto';
import { FindRespaldoControladoresDto } from './dto/find-respaldo-Controladores.dto';

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
  @Post('/findControladorAndRespaldar')
  findOne(@Body() findControladoreDto: FindControladoreDto) {
    return this.controladoresService.respaldarTxt(findControladoreDto);
  }
}
