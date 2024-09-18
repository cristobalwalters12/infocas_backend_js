import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ControladoresService } from './controladores.service';
import { CreateControladoreDto } from './dto/create-controladore.dto';
import { UpdateControladoreDto } from './dto/update-controladore.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controladoresService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateControladoreDto: UpdateControladoreDto,
  ) {
    return this.controladoresService.update(+id, updateControladoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.controladoresService.remove(+id);
  }
}
