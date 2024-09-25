import { Injectable } from '@nestjs/common';
import { CreateControladoreDto } from './dto/create-controladore.dto';
import { FindControladoreDto } from './dto/find-controladore.dto';
import { Controlador } from './entities/controladore.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NombresSensoresService } from 'src/nombres_sensores/nombres_sensores.service';
import { SensoresService } from 'src/sensores/sensores.service';
@Injectable()
export class ControladoresService {
  constructor(
    @InjectRepository(Controlador)
    private controladorRepository: Repository<Controlador>,
    private sensoresService: SensoresService,
    private nombresSensoresService: NombresSensoresService,
  ) {}
  create(createControladoreDto: CreateControladoreDto) {
    return createControladoreDto;
  }

  async findAll() {
    return await this.controladorRepository.find();
  }

  async findOne(findControladoreDto: FindControladoreDto) {
    const { controlador, startDateTime, endDateTime } = findControladoreDto;
    try {
      const controladorEncontrado = await this.controladorRepository.findOne({
        where: { controlador },
      });
  
      if (!controladorEncontrado) {
        throw new Error('Controlador no encontrado');
      }
  
      const sensores = await this.nombresSensoresService.findsensoresBycontrolador(controladorEncontrado.id);
  
      const resultados = await Promise.all(
        sensores.map(async (sensor) => {
          const nombreSensor = sensor.nombre_sensor;
          return await this.sensoresService.findRangeInformation({
            nombreSensor,
            startDateTime,
            endDateTime,
          });
        })
      );
  
      return resultados.flat();
    } catch (error) {
      console.error('Error en findOne:', error);
      throw new Error('Error al obtener datos del controlador');
    }
  }
  
  
}
