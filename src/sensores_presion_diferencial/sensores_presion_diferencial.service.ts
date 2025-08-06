import { Injectable } from '@nestjs/common';
import { CreateSensoresPresionDiferencialDto } from './dto/create-sensores_presion_diferencial.dto';
import { UpdateSensoresPresionDiferencialDto } from './dto/update-sensores_presion_diferencial.dto';
import { InformationDiferencialDto } from './dto/information-prediff-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensoresPresionDiferencial } from './entities/sensores_presion_diferencial.entity';
import { NombreSensoresPresionDiferencialService } from 'src/nombre_sensores_presion_diferencial/nombre_sensores_presion_diferencial.service';

@Injectable()
export class SensoresPresionDiferencialService {
  constructor(
    @InjectRepository(SensoresPresionDiferencial)
    private sensoresPresionDiferencialRepository: Repository<SensoresPresionDiferencial>,
    private readonly nombreSensoresPresionDiferencialService: NombreSensoresPresionDiferencialService,
  ) {}
  async create(
    createSensoresPresionDiferencialDto: CreateSensoresPresionDiferencialDto,
  ) {
    const sensoresPresionDiferencial =
      this.sensoresPresionDiferencialRepository.create(
        createSensoresPresionDiferencialDto,
      );
    return await this.sensoresPresionDiferencialRepository.save(
      sensoresPresionDiferencial,
    );
  }

  async findAll() {
    return this.sensoresPresionDiferencialRepository.find();
  }

  async findRangeInformationPressureDifferential(
    informationDto: InformationDiferencialDto,
  ) {
    const { nombreSensorPresionDiferencial, startDateTime, endDateTime } =
      informationDto;

    console.log(
      `Buscando datos del sensor: ${nombreSensorPresionDiferencial} desde ${startDateTime} hasta ${endDateTime}`,
    );
    const [sensorInfo] =
      await this.nombreSensoresPresionDiferencialService.findIdWithTheName(
        nombreSensorPresionDiferencial,
      );
    const idSensor = sensorInfo?.id_sensor;
    const nombreSensor = sensorInfo?.nombre_sensor_pre_dif;
    const query = `
      SELECT *  FROM sensores_pre_dif
      WHERE id_sensor = ? 
      AND fecha_hora >=? 
      AND fecha_hora <= ? 
      ORDER BY fecha_hora ASC;
  `;
    const result = await this.sensoresPresionDiferencialRepository.query(
      query,
      [idSensor, startDateTime, endDateTime],
    );
    return { result, nombreSensor };
  }
  async findPressureDifferentialRange(
    informationDto: InformationDiferencialDto,
  ) {
    const { nombreSensorPresionDiferencial, startDateTime, endDateTime } =
      informationDto;
    const query = `
    SELECT MIN(Dif_Ch1) as minima_presion_diferencial_ch1,
           MAX(Dif_Ch1) as maxima_presion_diferencial_ch1,
           MIN(Dif_Ch2) as minima_presion_diferencial_ch2,
           MAX(Dif_Ch2) as maxima_presion_diferencial_ch2
    FROM sensores_pre_dif
    INNER JOIN nombres_sensores_pre_dif ON nombres_sensores_pre_dif.id_sensor = sensores_pre_dif.id_sensor
    WHERE nombres_sensores_pre_dif.nombre_sensor_pre_dif = ?
      AND CONCAT(fecha, ' ', hora) BETWEEN ? AND ?
    ORDER BY fecha, hora ASC
  `;
    const result = await this.sensoresPresionDiferencialRepository.query(
      query,
      [nombreSensorPresionDiferencial, startDateTime, endDateTime],
    );

    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} sensoresPresionDiferencial`;
  }

  async update(
    id: number,
    updateSensoresPresionDiferencialDto: UpdateSensoresPresionDiferencialDto,
  ) {
    try {
      await this.sensoresPresionDiferencialRepository.update(
        { id_sensor: id },
        updateSensoresPresionDiferencialDto,
      );
      return await this.sensoresPresionDiferencialRepository.findOne({
        where: { id_sensor: id },
      });
    } catch (error) {
      console.error('Error updating sensor:', error);
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} sensoresPresionDiferencial`;
  }
}
