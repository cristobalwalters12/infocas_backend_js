import { HttpException, Injectable } from '@nestjs/common';
import {
  CreateSensoreDto,
  UpdateSensoreDto,
  InformationDto,
} from './dto/index';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensores } from './entities/sensore.entity';
@Injectable()
export class SensoresService {
  constructor(
    @InjectRepository(Sensores)
    private readonly sensoresRepository: Repository<Sensores>,
  ) {}
  async create(createSensoreDto: CreateSensoreDto) {
    try {
      const sensores = this.sensoresRepository.create(createSensoreDto);
      return await this.sensoresRepository.save(sensores);
    } catch (error) {
      throw new HttpException('error al guardar', 500);
    }
  }

  async findAll(paginationDto?: any): Promise<any> {
    try {
      if (paginationDto?.limit && paginationDto?.page) {
        const skip =
          Number(paginationDto.limit) * (Number(paginationDto.page) - 1);
        const limit = Number(paginationDto.limit);

        const [result, total] = await this.sensoresRepository.findAndCount({
          skip: skip,
          take: limit,
        });

        return {
          data: result,
          pagination: {
            itemsPerPage: paginationDto.limit,
            currentPage: paginationDto.page,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
          },
        };
      }

      const result = await this.sensoresRepository.find();
      return {
        data: result,
      };
    } catch (error) {
      throw new HttpException('Error al buscar', 500);
    }
  }

  async findOne(id: number) {
    try {
      return await this.sensoresRepository.findOne({
        where: { numero_registro: id },
      });
    } catch (error) {
      throw new HttpException('error al buscar', 500);
    }
  }

  async findRangeInformation(informationDto: InformationDto) {
    const { id_sensor, startDateTime, endDateTime } = informationDto;

    const query =
      'SELECT * FROM `sensores` ' +
      'INNER JOIN nombres_sensores ON nombres_sensores.id_sensor = sensores.id_sensor ' +
      'WHERE nombres_sensores.nombre_sensor = ? ' +
      "AND CONCAT(fecha, ' ', hora) BETWEEN ? AND ? " +
      'ORDER BY fecha, hora ASC';

    const result = await this.sensoresRepository.query(query, [
      id_sensor,
      startDateTime,
      endDateTime,
    ]);

    return result;
  }

  async update(id: number, updateSensoreDto: UpdateSensoreDto) {
    try {
      await this.sensoresRepository.update(
        { numero_registro: id },
        updateSensoreDto,
      );
      return await this.sensoresRepository.findOne({
        where: { numero_registro: id },
      });
    } catch (error) {
      throw new HttpException('error al actualizar', 500);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} sensore`;
  }
}
