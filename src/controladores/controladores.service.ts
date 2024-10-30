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

      console.log('Controlador encontrado:', controladorEncontrado);

      if (!controladorEncontrado) {
        throw new Error('Controlador no encontrado');
      }

      const sensores =
        await this.nombresSensoresService.findsensoresBycontrolador(
          controladorEncontrado.id,
        );

      console.log('Sensores encontrados:', sensores);

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

      const datos = resultados.flat(); // Aplanar los resultados
      console.log('Datos obtenidos:', datos);
      const contenidoTXT = this.generarContenidoTXT(sensores, datos); // Generar el contenido del archivo

      const sftp = new SftpClient();
      try {
        await sftp.connect({
          host: this.configService.get('FTP_HOST'),
          port: this.configService.get('FTP_PORT'),
          username: this.configService.get('FTP_USER'),
          password: this.configService.get('FTP_PASS'),
        });

        const fecha = new Date(Date.now() - 3 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        const rutaArchivo = `/root/respaldo/${controlador}/${controlador}-${fecha}-Web.txt`;

        // Subir el archivo al servidor SFTP
        await sftp.put(Buffer.from(contenidoTXT), rutaArchivo);
        console.log('Archivo subido exitosamente');

        return { message: 'Archivo subido exitosamente' };
      } catch (err) {
        console.error('Error al subir el archivo:', err);
        return { message: 'Error al subir el archivo', error: err };
      } finally {
        await sftp.end();
      }
    } catch (error) {
      console.error('Error en findOne:', error);
      throw new Error('Error al obtener datos del controlador');
    }
  }
  // Formatear la fecha y hora desde una fecha ISO
  private formatearFechaHora(fechaISO: string, hora: string): string {
    const fecha = new Date(fechaISO); // Convertir a objeto Date

    // Extraer día, mes y año con dos dígitos
    const day = fecha.getUTCDate().toString().padStart(2, '0');
    const month = (fecha.getUTCMonth() + 1).toString().padStart(2, '0'); // Enero es 0
    const year = fecha.getUTCFullYear();

    // Combinar en formato DD/MM/YYYY HH:mm:ss
    return `${day}/${month}/${year} ${hora}`;
  }

  // Agrupar los datos por fecha y hora
  private agruparDatosPorFechaHora(datos: any[]): Record<string, any> {
    const datosAgrupados: Record<string, any> = {};

    datos.forEach((dato) => {
      try {
        const fechaHora = this.formatearFechaHora(dato.fecha, dato.hora);

        if (!datosAgrupados[fechaHora]) {
          datosAgrupados[fechaHora] = {};
        }
        datosAgrupados[fechaHora][dato.nombre_sensor] = dato;
      } catch (error) {
        console.error(
          `Error al procesar el dato: ${JSON.stringify(dato)}`,
          error,
        );
      }
    });

    return datosAgrupados;
  }

  // Generar el contenido del archivo TXT
  private generarContenidoTXT(sensores: any[], datos: any[]): string {
    const cabecera = this.generarCabecera(sensores);
    const datosAgrupados = this.agruparDatosPorFechaHora(datos);

    const nombresUnicos = Array.from(
      new Set(sensores.map((sensor) => sensor.nombre_sensor)),
    );

    const cuerpo = Object.entries(datosAgrupados)
      .map(([fechaHora, registros]) => {
        const voltaje = '12.0'; // Valor fijo
        const trigger = 'Time:()'; // Trigger fijo

        const columnasSensores = nombresUnicos.map((nombre) => {
          const registro = registros[nombre];
          return registro ? `${registro.temperatura},${registro.humedad}` : ',';
        });

        return `${fechaHora} DST,${voltaje},${columnasSensores.join(',')},${trigger}`;
      })
      .join('\n');

    return cabecera + cuerpo;
  }

  // Generar la cabecera dinámica
  private generarCabecera(sensores: any[]): string {
    const nombresUnicos = Array.from(
      new Set(sensores.map((sensor) => sensor.nombre_sensor)),
    );

    const columnas = nombresUnicos
      .map((nombre) => `${nombre} T°(C),${nombre} H%(%RH)`)
      .join(',');

    const cabeceraBase = 'Date Time,Vin(V)';
    return `${cabeceraBase},${columnas},Trigger\n`;
  }

  async descargarRespaldo(
    downloadControladorDto: DownloadControladorDto,
    res: Response,
  ) {
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
