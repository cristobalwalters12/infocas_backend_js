import { Injectable } from '@nestjs/common';
import { CreateControladoreDto } from './dto/create-controladore.dto';
import { FindControladoreDto } from './dto/find-controladore.dto';
import { FindRespaldoControladoresDto } from './dto/find-respaldo-Controladores.dto';
import { DownloadControladorDto } from './dto/download-controlador.dto';
import { Controlador } from './entities/controladore.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NombresSensoresService } from 'src/nombres_sensores/nombres_sensores.service';
import { SensoresService } from 'src/sensores/sensores.service';
import * as SftpClient from 'ssh2-sftp-client';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
@Injectable()
export class ControladoresService {
  constructor(
    @InjectRepository(Controlador)
    private controladorRepository: Repository<Controlador>,
    private sensoresService: SensoresService,
    private nombresSensoresService: NombresSensoresService,
    private configService: ConfigService,
  ) {}
  create(createControladoreDto: CreateControladoreDto) {
    return createControladoreDto;
  }

  async findAll() {
    return await this.controladorRepository.find();
  }

  async getControladoresRespaldos(
    findRespaldoControladoresDto: FindRespaldoControladoresDto,
  ) {
    const { controlador } = findRespaldoControladoresDto;
    const sftp = new SftpClient();
    try {
      await sftp.connect({
        host: this.configService.get('FTP_HOST'),
        port: this.configService.get('FTP_PORT'),
        username: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
      });

      const listado = await sftp.list('/root/respaldo/' + controlador);
      const transformedListado = listado.map((file) => {
        const match = file.name.match(/\d{4}-\d{2}-\d{2}/);
        const date = match ? new Date(match[0]) : new Date(file.modifyTime);

        return {
          name: file.name,
          size: file.size,
          modifyTime: file.modifyTime,
          date,
        };
      });
      const sortedListado = transformedListado.sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      );
      const finalListado = sortedListado.map((file) => ({
        name: file.name,
        size: file.size,
      }));

      return finalListado;
    } catch (err) {
      console.error(err);
      return err;
    } finally {
      await sftp.end();
    }
  }

  async respaldarTxt(findControladoreDto: FindControladoreDto) {
    const { controlador, startDateTime, endDateTime } = findControladoreDto;
    try {
      const controladorEncontrado = await this.controladorRepository.findOne({
        where: { controlador },
      });

      if (!controladorEncontrado) {
        throw new Error('Controlador no encontrado');
      }

      const sensores =
        await this.nombresSensoresService.findsensoresBycontrolador(
          controladorEncontrado.id,
        );

      const resultados = await Promise.all(
        sensores.map(async (sensor: any) => {
          const nombreSensor = sensor.nombre_sensor;
          return await this.sensoresService.findRangeInformation({
            nombreSensor,
            startDateTime,
            endDateTime,
          });
        }),
      );
      const data = JSON.stringify(resultados.flat(), null, 2);
      const sftp = new SftpClient();

      try {
        await sftp.connect({
          host: this.configService.get('FTP_HOST'),
          port: this.configService.get('FTP_PORT'),
          username: this.configService.get('FTP_USER'),
          password: this.configService.get('FTP_PASS'),
        });
        await sftp.put(
          Buffer.from(data),
          `/root/respaldo/pruebas/${controlador}.txt`,
        );

        console.log(
          await sftp.put(
            Buffer.from(data),
            `/root/respaldo/pruebas/${controlador}.txt`,
          ),
        );
        console.log('Archivo subido exitosamente');

        return {
          message: 'Archivo subido exitosamente',
        };
      } catch (err) {
        console.error(err);
        return {
          message: 'Error al subir el archivo',
          error: err,
        };
      } finally {
        await sftp.end();
      }
    } catch (error) {
      console.error('Error en findOne:', error);
      throw new Error('Error al obtener datos del controlador');
    }
  }
  async descargarRespaldo(downloadControladorDto: DownloadControladorDto, res: Response) {
    const { controlador, archivo } = downloadControladorDto;
    const sftp = new SftpClient();

    try {
      await sftp.connect({
        host: this.configService.get('FTP_HOST'),
        port: this.configService.get('FTP_PORT'),
        username: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
      });
      
      const remoteFilePath = `/root/respaldo/${controlador}/${archivo}`;
      
      const fileContent = await sftp.get(remoteFilePath);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${archivo}"`);
      if (Buffer.isBuffer(fileContent) || typeof fileContent === 'string') {
        res.send(fileContent);
      } else {
        throw new Error('Formato de archivo no soportado');
      }

    } catch (err) {
      console.error('Error al descargar el archivo:', err);
      res.status(500).json({ message: 'Error al descargar el archivo' });
    } finally {
      await sftp.end();
    }
  }
}

 
  

