import { Injectable } from '@nestjs/common';
import { CreateNombresSensoreDto } from './dto/create-nombres_sensore.dto';
import { UpdateNombresSensoreDto } from './dto/update-nombres_sensore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NombresSensore } from './entities/nombres_sensore.entity';
@Injectable()
export class NombresSensoresService {
  constructor(
    @InjectRepository(NombresSensore)
    private nombresSensoreRepository: Repository<NombresSensore>,
  ) {}

  async create(createNombresSensoreDto: CreateNombresSensoreDto) {
    const nombresSensore = this.nombresSensoreRepository.create(
      createNombresSensoreDto,
    );
    return await this.nombresSensoreRepository.save(nombresSensore);
  }

  async findAll() {
    const query =
      'SELECT nombre_sensor FROM nombres_sensores ORDER BY RIGHT(nombre_sensor ,4) ASC';
    return await this.nombresSensoreRepository.query(query);
  }

  async findOne(id: number) {
    return await this.nombresSensoreRepository.findOne({
      where: { id_sensor: id },
    });
  }

  async update(id: number, updateNombresSensoreDto: UpdateNombresSensoreDto) {
    await this.nombresSensoreRepository.update(
      { id_sensor: id },
      updateNombresSensoreDto,
    );
    return await this.nombresSensoreRepository.findOne({
      where: { id_sensor: id },
    });
  }

  async remove(id: number) {
    await this.nombresSensoreRepository.delete({ id_sensor: id });
    return { deleted: true };
  }
}
