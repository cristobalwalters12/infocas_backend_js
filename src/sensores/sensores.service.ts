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
    const { nombreSensor, startDateTime, endDateTime } = informationDto;

    const [fechaInicio, horaInicio] = startDateTime.split(' ');
    const [fechaFin, horaFin] = endDateTime.split(' ');
    console.table({ fechaInicio, horaInicio, fechaFin, horaFin });
    const query = `
      SELECT *
      FROM (
        SELECT 
          s.numero_registro,
          s.id_sensor,
          s.temperatura,
          s.humedad,
          s.fecha,
          s.hora,
          ns.nombre_sensor
        FROM sensores s
        INNER JOIN nombres_sensores ns ON ns.id_sensor = s.id_sensor
        WHERE ns.nombre_sensor = ?
      ) AS sub
      WHERE (
        sub.fecha > ?
        OR (sub.fecha = ? AND sub.hora >= ?)
      )
      AND (
        sub.fecha < ?
        OR (sub.fecha = ? AND sub.hora <= ?)
      )
      ORDER BY sub.fecha ASC, sub.hora ASC;
    `;

    const result = await this.sensoresRepository.query(query, [
      nombreSensor, // ns.nombre_sensor = ?
      fechaInicio, // sub.fecha > ?
      fechaInicio, // sub.fecha = ?
      horaInicio, // sub.hora >= ?
      fechaFin, // sub.fecha < ?
      fechaFin, // sub.fecha = ?
      horaFin, // sub.hora <= ?
    ]);

    return result;
  }

  async findTemperatureRange(informationDto: InformationDto) {
    const { nombreSensor, startDateTime, endDateTime } = informationDto;

    const query = `
    SELECT ROUND(MIN(temperatura),2) as minima_temperatura,
           ROUND(MAX(temperatura),2) as maxima_temperatura,
           CASE 
             WHEN nombres_sensores.nombre_sensor = 'CAMARA FRIA CASINO PR-TGHP-65' THEN 0
             ELSE ROUND(MIN(humedad),2)
           END as minima_humedad,
           CASE 
             WHEN nombres_sensores.nombre_sensor = 'CAMARA FRIA CASINO PR-TGHP-65' THEN 0
             ELSE ROUND(MAX(humedad),2)
           END as maxima_humedad
    FROM sensores 
    INNER JOIN nombres_sensores ON nombres_sensores.id_sensor = sensores.id_sensor
    WHERE nombres_sensores.nombre_sensor = ?
      AND CONCAT(fecha, ' ', hora) BETWEEN ? AND ?
    ORDER BY fecha, hora ASC
  `;

    const result = await this.sensoresRepository.query(query, [
      nombreSensor,
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
