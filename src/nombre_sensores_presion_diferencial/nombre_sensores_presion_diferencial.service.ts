import { Injectable } from '@nestjs/common';
import { CreateNombreSensoresPresionDiferencialDto } from './dto/create-nombre_sensores_presion_diferencial.dto';
import { UpdateNombreSensoresPresionDiferencialDto } from './dto/update-nombre_sensores_presion_diferencial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NombreSensoresPresionDiferencial } from './entities/nombre_sensores_presion_diferencial.entity';
@Injectable()
export class NombreSensoresPresionDiferencialService {
  constructor(
    @InjectRepository(NombreSensoresPresionDiferencial)
    private nombreSensoresPresionDiferencialRepository: Repository<NombreSensoresPresionDiferencial>,
  ) {}
  async create(
    createNombreSensoresPresionDiferencialDto: CreateNombreSensoresPresionDiferencialDto,
  ) {
    const nombreSensoresPresionDiferencial =
      this.nombreSensoresPresionDiferencialRepository.create(
        createNombreSensoresPresionDiferencialDto,
      );
    return await this.nombreSensoresPresionDiferencialRepository.save(
      nombreSensoresPresionDiferencial,
    );
  }

  findAll() {
    return this.nombreSensoresPresionDiferencialRepository.find();
  }

  async findLastHourRegisters(id: number) {
    const query = `
      SELECT s.*, ns.nombre_sensor_pre_dif
      FROM sensores_pre_dif s
      INNER JOIN nombres_sensores_pre_dif ns ON s.id_sensor = ns.id_sensor
      WHERE s.id_sensor = ?
      ORDER BY s.fecha DESC, s.hora DESC
      LIMIT 1
    `;

    return await this.nombreSensoresPresionDiferencialRepository.query(query, [
      id,
    ]);
  }

  async findIds() {
    const array: any[] = [];
    const query =
      'SELECT id_sensor FROM nombres_sensores_pre_dif ORDER BY id_sensor ASC';
    const result =
      await this.nombreSensoresPresionDiferencialRepository.query(query);
    for (const id of result) {
      const lastHourRegister = await this.findLastHourRegisters(id.id_sensor);
      array.push(lastHourRegister);
    }
    return array.flatMap((x) => x);
  }

  async findOnlyNames() {
    const query =
      'SELECT nombre_sensor_pre_dif FROM nombres_sensores_pre_dif ORDER BY RIGHT(nombre_sensor_pre_dif ,4) ASC';
    return await this.nombreSensoresPresionDiferencialRepository.query(query);
  }

  async findOne(id: number) {
    return await this.nombreSensoresPresionDiferencialRepository.findOne({
      where: { id_sensor: id },
    });
  }

  async update(
    id: number,
    updateNombreSensoresPresionDiferencialDto: UpdateNombreSensoresPresionDiferencialDto,
  ) {
    await this.nombreSensoresPresionDiferencialRepository.update(
      id,
      updateNombreSensoresPresionDiferencialDto,
    );
    return this.findOne(id);
  }

  async findsensoresBycontrolador(id: number) {
    const query = `SELECT * FROM nombres_sensores_pre_dif where controlador_pre_dif_id = ${id}`;
    return await this.nombreSensoresPresionDiferencialRepository.query(query);
  }
}
