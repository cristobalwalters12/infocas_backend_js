import { Controller, Get, Post, Body } from '@nestjs/common';
import { ControladoresService } from './controladores.service';
import { CreateControladoreDto } from './dto/create-controladore.dto';

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
}
