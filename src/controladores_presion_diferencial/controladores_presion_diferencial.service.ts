import { Injectable } from '@nestjs/common';
import { CreateControladoresPresionDiferencialDto } from './dto/create-controladores_presion_diferencial.dto';
import { ControladoresPresionDiferencial } from './entities/controladores_presion_diferencial.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { NombreSensoresPresionDiferencialService } from '../nombre_sensores_presion_diferencial/nombre_sensores_presion_diferencial.service';
import { SensoresPresionDiferencialService } from '../sensores_presion_diferencial/sensores_presion_diferencial.service';
import { FindRespaldoControladoresPreDifDto } from './dto/find-respaldo-controladores-predif.dto';
import { FindArchivoRespaldoControladoresPreDifDto } from './dto/find-archivo-controladores-predif.dto';
import { FindControladorePreDifDto } from './dto/find-controladores-predif.dto';
//import { lastValueFrom } from 'rxjs';
import * as SftpClient from 'ssh2-sftp-client';
//import { Response } from 'express';
@Injectable()
export class ControladoresPresionDiferencialService {
  constructor(
    @InjectRepository(ControladoresPresionDiferencial)
    private controladoresPresionDiferencialRepository: Repository<ControladoresPresionDiferencial>,
    private nombreSensoresPresionDiferencialService: NombreSensoresPresionDiferencialService,
    private sensoresPresionDiferencialService: SensoresPresionDiferencialService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  create(
    createControladoresPresionDiferencialDto: CreateControladoresPresionDiferencialDto,
  ) {
    return createControladoresPresionDiferencialDto;
  }

  async findAll() {
    return await this.controladoresPresionDiferencialRepository.find();
  }

  async getControladoresRespaldoPreDif(
    findRespaldoControladoresPreDifDto: FindRespaldoControladoresPreDifDto,
  ) {
    const { controlador } = findRespaldoControladoresPreDifDto;
    const sftp = new SftpClient();
    try {
      await sftp.connect({
        host: this.configService.get('FTP_HOST'),
        port: this.configService.get('FTP_PORT'),
        username: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
      });
      const remotePath = `/root/respaldo/presion_diferencial/${controlador}`;
      const files = await sftp.list(remotePath);
      console.log(`Archivos en el directorio remoto ${remotePath}:`, files);

      return files.map((file) => ({
        name: file.name,
        size: file.size,
        date: file.modifyTime,
      }));
    } catch (error) {
      console.error('Error al obtener los respaldos de controladores:', error);
      throw new Error('No se pudieron obtener los respaldos de controladores');
    }
  }
  async getArchivosControlador(
    findArchivoRespaldoControladoresPreDifDto: FindArchivoRespaldoControladoresPreDifDto,
  ) {
    const { controlador, carpeta } = findArchivoRespaldoControladoresPreDifDto;
    const sftp = new SftpClient();
    try {
      await sftp.connect({
        host: this.configService.get('FTP_HOST'),
        port: this.configService.get('FTP_PORT'),
        username: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
      });
      const remotePath = `/root/respaldo/presion_diferencial/${controlador}/${carpeta}`;
      const files = await sftp.list(remotePath);

      return files.map((file) => ({
        name: file.name,
        size: file.size,
        date: file.modifyTime,
      }));
    } catch (error) {
      console.error('Error al obtener los respaldos de sensores:', error);
      throw new Error('No se pudieron obtener los respaldos de sensores');
    }
  }

  async respaldoSensoresPreDif(
    findControladorePreDifDto: FindControladorePreDifDto,
  ) {
    const { controlador, startDateTime, endDateTime } =
      findControladorePreDifDto;
    try {
      const controladorEncontrado =
        await this.controladoresPresionDiferencialRepository.findOne({
          where: { controlador },
        });
      console.log('Controlador encontrado:', controladorEncontrado);
      if (!controladorEncontrado) {
        throw new Error('Controlador no encontrado');
      }
      const sensoresPreDif =
        await this.nombreSensoresPresionDiferencialService.findsensoresBycontrolador(
          controladorEncontrado.id,
        );
      const resultados = await Promise.all(
        sensoresPreDif.map(async (sensor: any) => {
          const nombreSensorPresionDiferencial = sensor.nombre_sensor_pre_dif;
          return await this.sensoresPresionDiferencialService.findPressureDifferentialRange(
            {
              nombreSensorPresionDiferencial,
              startDateTime,
              endDateTime,
            },
          );
        }),
      );
      const datos = resultados.flat();

      console.log('Datos obtenidos:', datos);
    } catch (error) {
      console.error('Error al buscar el controlador:', error);
      throw new Error('Controlador no encontrado');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} controladoresPresionDiferencial`;
  }
}
