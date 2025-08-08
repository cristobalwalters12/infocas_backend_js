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
    console.log('Controlador:', controlador);
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
          const result =
            await this.sensoresPresionDiferencialService.findRangeInformationPressureDifferential(
              {
                nombreSensorPresionDiferencial,
                startDateTime,
                endDateTime,
              },
            );
          return {
            nombre_sensor: nombreSensorPresionDiferencial,
            result: result.result,
          };
        }),
      );
      const datos = resultados.flatMap((item) =>
        item.result.map((registro: any) => ({
          ...registro,
          nombre_sensor: item.nombre_sensor,
        })),
      );
      await this.generarArchivosPorSensor(datos);
    } catch (error) {
      console.error('Error al buscar el controlador:', error);
      throw new Error('Controlador no encontrado');
    }
  }
  private async generarArchivosPorSensor(datos: any[]) {
    const datosAgrupados: Record<string, any[]> = {};

    // Agrupar datos por nombre_sensor
    datos.forEach((dato) => {
      if (!datosAgrupados[dato.nombre_sensor]) {
        datosAgrupados[dato.nombre_sensor] = [];
      }
      datosAgrupados[dato.nombre_sensor].push(dato);
    });

    const sftp = new SftpClient();

    try {
      await sftp.connect({
        host: this.configService.get('FTP_HOST'),
        port: this.configService.get('FTP_PORT'),
        username: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
      });

      for (const [nombreSensor, registros] of Object.entries(datosAgrupados)) {
        const contenidoTXT = registros
          .map((registro) => {
            const deviceName = nombreSensor
              .replace(/^.*?PR-TGHP-/, 'PR-TGHP ')
              .trim();

            const fecha =
              registro.fecha instanceof Date
                ? registro.fecha.toISOString().split('T')[0]
                : registro.fecha;

            const time = `${fecha} ${registro.hora}`;

            return JSON.stringify({
              deviceName,
              ch1: registro.Dif_Ch1,
              ch2: registro.Dif_Ch2,
              time,
            });
          })
          .join('\n');

        // Usa la misma lógica de rutas o ajusta según estos sensores
        const rutasPersonalizadas: Record<string, string> = {
          'DIF 34': '/root/respaldo/presion_diferencial/UG65/DIF 34/',
          // Agrega más sensores si es necesario
        };

        const fechaArchivo = new Date(Date.now() - 3 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        const nombreArchivo: string = `${nombreSensor.replace(/ /g, '_')}-${fechaArchivo}-Web.txt`;
        const directorioBase =
          rutasPersonalizadas[nombreSensor] || '/root/respaldo/otros/';
        const rutaRemota: string = `${directorioBase}${nombreArchivo}`;

        await sftp.put(Buffer.from(contenidoTXT), rutaRemota);

        console.log(`Archivo subido para ${nombreSensor}: ${rutaRemota}`);
      }
    } catch (error) {
      console.error('Error al subir archivos mediante SFTP:', error);
    } finally {
      await sftp.end();
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} controladoresPresionDiferencial`;
  }
}
