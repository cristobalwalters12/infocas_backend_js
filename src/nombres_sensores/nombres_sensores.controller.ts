import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NombresSensoresService } from './nombres_sensores.service';
import { CreateNombresSensoreDto } from './dto/create-nombres_sensore.dto';
import { UpdateNombresSensoreDto } from './dto/update-nombres_sensore.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('nombres-sensores')
export class NombresSensoresController {
  constructor(
    private readonly nombresSensoresService: NombresSensoresService,
  ) {}

  

  @Post()
  create(@Body() createNombresSensoreDto: CreateNombresSensoreDto) {
    return this.nombresSensoresService.create(createNombresSensoreDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.nombresSensoresService.findAll();
  }
  @Get('/IdsPosibles')
  findIds() {
    return this.nombresSensoresService.findIds();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nombresSensoresService.findOne(+id);
  }

  
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNombresSensoreDto: UpdateNombresSensoreDto,
  ) {
    return this.nombresSensoresService.update(+id, updateNombresSensoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nombresSensoresService.remove(+id);
  }
}
