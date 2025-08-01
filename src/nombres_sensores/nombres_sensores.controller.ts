import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // UseGuards,
} from '@nestjs/common';
import { NombresSensoresService } from './nombres_sensores.service';
import { CreateNombresSensoreDto } from './dto/create-nombres_sensore.dto';
import { UpdateNombresSensoreDto } from './dto/update-nombres_sensore.dto';
//import { AuthGuard } from '@nestjs/passport';

@Controller('nombres-sensores')
export class NombresSensoresController {
  constructor(
    private readonly nombresSensoresService: NombresSensoresService,
  ) {}

  @Get('/IdsPosibles')
  findIds() {
    return this.nombresSensoresService.findIds();
  }

  @Post()
  create(@Body() createNombresSensoreDto: CreateNombresSensoreDto) {
    return this.nombresSensoresService.create(createNombresSensoreDto);
  }
  @Post('/SensoresControlador')
  FindSensoresControlador(@Body() body: { id: number }) {
    const id = body.id;
    console.log(id);
    return this.nombresSensoresService.findsensoresBycontrolador(id);
  }

  @Get()
  //@UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.nombresSensoresService.findAll();
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
