import { Injectable } from '@nestjs/common';
import { CreateControladoreDto } from './dto/create-controladore.dto';
import { FindControladoreDto } from './dto/find-controladore.dto';
import { FindRespaldoControladoresDto } from './dto/find-respaldo-Controladores.dto';
import { DownloadControladorDto } from './dto/download-controlador.dto';
import { FindArchivoRespaldoControladoresDto } from './dto/find-archivo-Controladores.dto';
import { DownloadGatewayDto } from './dto/dowload-gateway.dto';
import { Controlador } from './entities/controladore.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NombresSensoresService } from 'src/nombres_sensores/nombres_sensores.service';
import { SensoresService } from 'src/sensores/sensores.service';
import * as SftpClient from 'ssh2-sftp-client';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ControladoresService {
  constructor(
    @InjectRepository(Controlador)
    private controladorRepository: Repository<Controlador>,
    private sensoresService: SensoresService,
    private nombresSensoresService: NombresSensoresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
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
  async getArchivosControlador(
    FindArchivoRespaldoControladoresDto: FindArchivoRespaldoControladoresDto,
  ) {
    const { controlador, carpeta } = FindArchivoRespaldoControladoresDto;
    const sftp = new SftpClient();
    try {
      await sftp.connect({
        host: this.configService.get('FTP_HOST'),
        port: this.configService.get('FTP_PORT'),
        username: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
      });

      console.log('Conectado al servidor SFTP', controlador, carpeta);

      const listado = await sftp.list(
        '/root/respaldo/' + controlador + '/' + carpeta,
      );
      return listado.map((file) => ({
        name: file.name,
        size: file.size,
        modifyTime: file.modifyTime,
      }));
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

      const datos = resultados.flat();
      const contenidoTXT = this.generarContenidoTXT(sensores, datos);

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
  ////////////////////////////////////////////////////////////////
  async respaldo_Sensores2025(findControladoreDto: FindControladoreDto) {
    const { controlador, startDateTime, endDateTime } = findControladoreDto;
    try {
      const controladorEncontrado = await this.controladorRepository.findOne({
        where: { controlador },
      });
      console.log(controladorEncontrado);

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
          //console.log(nombreSensor);
          return await this.sensoresService.findRangeInformation({
            nombreSensor,
            startDateTime,
            endDateTime,
          });
        }),
      );

      const datos = resultados.flat(); // Aplanar el array de resultados

      // Llamar a la función para generar los archivos por sensor
      await this.generarArchivosPorSensor(datos);

      return {
        message: 'Archivos generados exitosamente para cada sensor',
      };
    } catch (error) {
      console.error('Error en findOne:', error);
      throw new Error('Error al obtener datos del controlador');
    }
  }
  private async generarArchivosPorSensor(datos: any[]) {
    const datosAgrupados: Record<string, any[]> = {};

    datos.forEach((dato) => {
      if (!datosAgrupados[dato.nombre_sensor]) {
        datosAgrupados[dato.nombre_sensor] = [];
      }
      datosAgrupados[dato.nombre_sensor].push(dato);
    });

    // Configurar conexión SFTP
    const sftp = new SftpClient();
    try {
      await sftp.connect({
        host: this.configService.get('FTP_HOST'),
        port: this.configService.get('FTP_PORT'),
        username: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
      });

      // Procesar cada grupo de datos por `nombre_sensor`
      for (const [nombreSensor, registros] of Object.entries(datosAgrupados)) {
        // Crear el contenido del archivo en el formato solicitado
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
              humidity: registro.humedad,
              temperature: registro.temperatura,
              time,
            });
          })
          .join('\n');

        const rutasPersonalizadas: Record<string, string> = {
          'BODEGA SUB N1P4 PR-TGHP-01': '/root/respaldo/UG65SUB/01/',
          'BODEGA SUB N2P4 PR-TGHP-02': '/root/respaldo/UG65SUB/02/',
          'BODEGA SUB N3P23 PR-TGHP-03': '/root/respaldo/UG65SUB/03/',
          'BODEGA SUB N4P33 PR-TGHP-04': '/root/respaldo/UG65SUB/04/',
          'BODEGA SUB N3P27 PR-TGHP-05': '/root/respaldo/UG65SUB/05/',
          'BODEGA SUB N4P37 PR-TGHP-06': '/root/respaldo/UG65SUB/06/',
          'BODEGA SUB N_P_ PR-TGHP-07': '/root/respaldo/UG65SUB/07/',
          'BODEGA SUB N2P15 PR-TGHP-08': '/root/respaldo/UG65SUB/08/',
          'BODEGA SUB N4P35 PR-TGHP-09': '/root/respaldo/UG65SUB/09/',
          'BODEGA SUB N3P20 PR-TGHP-10': '/root/respaldo/UG65SUB/10/',
          'BODEGA SUB N4P30 PR-TGHP-11': '/root/respaldo/UG65SUB/11/',
          'BODEGA SUB N3P24 PR-TGHP-12': '/root/respaldo/UG65SUB/12/',
          'BODEGA SUB N1P2 PR-TGHP-13': '/root/respaldo/UG65SUB/13/',
          'BODEGA SUB N2P11 PR-TGHP-14': '/root/respaldo/UG65SUB/14/',
          'PESAJE SALA N°1 PR-TGHP-15': '/root/respaldo/UG65P1/15/',
          'PESAJE SALA N°2 PR-TGHP-16': '/root/respaldo/UG65P1/16/',
          'SALA VÍA HUMEDA 1 PR-TGHP-17': '/root/respaldo/UG65P2/17/',
          'SALA VÍA HUMEDA 2 PR-TGHP-18': '/root/respaldo/UG65P2/18/',
          'SALA VÍA SECA M240 PR-TGHP-19': '/root/respaldo/UG65P2/19/',
          'SALA VÍA SECA M120 PR-TGHP-20': '/root/respaldo/UG65P2/20/',
          'TABLETERA N°1 PR-TGHP-21': '/root/respaldo/UG65P2/21/',
          'TABLETERA N°2 PR-TGHP-22': '/root/respaldo/UG65P2/22/',
          'TABLETERA N°3 PR-TGHP-23': '/root/respaldo/UG65P2/23/',
          'TABLETERA N°4 PR-TGHP-24': '/root/respaldo/UG65P2/24/',
          'TABLETERA N°5 PR-TGHP-25': '/root/respaldo/UG65P2/25/',
          'TABLETERA N°6 PR-TGHP-26': '/root/respaldo/UG65P2/26/',
          'RECUBRIMIENTO N°1 PR-TGHP-27': '/root/respaldo/UG65P2/27/',
          'RECUBRIMIENTO N°2 PR-TGHP-28': '/root/respaldo/UG65P2/28/',
          'RECUBRIMIENTO N°3 PR-TGHP-29': '/root/respaldo/UG65P2/29/',
          'SALA FRACCIONAMIENTO PR-TGHP-30': '/root/respaldo/UG65SUB/30/',
          'BLISTERA MARCHESINI 1 PR-TGHP-31': '/root/respaldo/UG65P1/31/',
          'LLENADORA COMAS PR-TGHP-32': '/root/respaldo/UG65P1/32/',
          'REACTOR CREMA PR-TGHP-33': '/root/respaldo/UG65P1/33/',
          'ENVASADO CREMAS TGM PR-TGHP-34': '/root/respaldo/UG65P1/34/',
          'REACTOR LIQUIDOS PR-TGHP-35': '/root/respaldo/UG65P1/35/',
          'BLISTERA ROMACO 1 PR-TGHP-36': '/root/respaldo/UG65P2/36/',
          'BLISTERA ROMACO 2 PR-TGHP-37': '/root/respaldo/UG65P2/37/',
          'BLISTERA MARCHESINI 2 PR-TGHP-38': '/root/respaldo/UG65P2/38/',
          'LÍNEA MANUAL 1 PR-TGHP-39': '/root/respaldo/UG65SUB/39/',
          'PASILLO GRANULADOS PR-TGHP-40': '/root/respaldo/UG65P2/40/',
          'BODEGA DE LÍQUIDOS PR-TGHP-41': '/root/respaldo/UG65P1/41/',
          'ESTUCHADO P1 PR-TGHP-42': '/root/respaldo/UG65P1/42/',
          'ESTUCHADO P2 PR-TGHP-43': '/root/respaldo/UG65P1/43/',
          'ESTUCHADO MARCHESINI 2 PR-TGHP-44': '/root/respaldo/UG65P1/44/',
          'PASILLO 1 BODEGA SANTA ELENA PR-TGHP-45':
            '/root/respaldo/UG65P1/45/',
          'PASILLO 2 BODEGA SANTA ELENA PR-TGHP-46':
            '/root/respaldo/UG65P1/46/',
          'PASILLO 3 BODEGA SANTA ELENA PR-TGHP-47':
            '/root/respaldo/UG65P1/47/',
          'PASILLO 4 BODEGA SANTA ELENA PR-TGHP-48':
            '/root/respaldo/UG65P1/48/',
          'DIFEXON PR-TGHP-49': '/root/respaldo/UG65P1/49/',
          'GRANELES CREMA PR-TGHP-50': '/root/respaldo/UG65P1/50/',
          'BODEGA DESPACHO PR-TGHP-51': '/root/respaldo/UG65P1/51/',
          'BAÑO MUJERES PR-TGHP-52': '/root/respaldo/UG65P1/52/',
          'BAÑO HOMBRES PR-TGHP-53': '/root/respaldo/UG65P1/53/',
          'BODEGA FOLIAS PR-TGHP-54': '/root/respaldo/UG65P1/54/',
          'ENVASADOS ALUMINIOS PR-TGHP-55': '/root/respaldo/UG65P1/55/',
          'SALA MUESTREO PR-TGHP-56': '/root/respaldo/UG65P1/56/',
          'BODEGA MUESTREO PR-TGHP-57': '/root/respaldo/UG65P1/57/',
          'PASILLO BODEGA MUESTREO PR-TGHP-58': '/root/respaldo/UG65P1/58/',
          'ESTUCHADORA CREMA PR-TGHP-59': '/root/respaldo/UG65P1/59/',
          'BODEGA PULMÓN PR-TGHP-60': '/root/respaldo/UG65 PESAJE/60/',
          'BODEGA PULMÓN FONDO PR-TGHP-61': '/root/respaldo/UG65 PESAJE/61/',
          'INFLAMABLES PR-TGHP-62': '/root/respaldo/UG65 PESAJE/62/',
          'VALOR MEDIO BODEGA PULMÓN':
            '/root/respaldo/UG65 PESAJE/valor medio bodega pulmon/',
          'PATENTE CAMION KGFS86 PR-TGHP-63': '/root/respaldo/CAMIONES/63/',
          'PATENTE CAMION DBDH PR-TGHP-64': '/root/respaldo/CAMIONES/64/',
          'CAMARA FRIA CASINO PR-TGHP-65': '/root/respaldo/UG65P2/65/',
          'CAMARA FRIA PR-TEM-122':
            '/root/respaldo/UG65P1/PR-TEM 112 Camara Fria Bodega/',
          'CAMARA FRESCA PR-TEM-123':
            '/root/respaldo/UG65P1/PR-TEM 113 Camara Fresca Bodega/',
          'VALOR BODEGA MUESTREO PROMEDIO':
            '/root/respaldo/UG65P1/valor medio bodega muestreo/',
          'VALOR MEDIO SUBTERRÁNEO': '/root/respaldo/UG65P1/subterraneo/',
          'VALOR BODEGA CENTRAL PROMEDIO':
            '/root/respaldo/UG65P1/valor medio bodega central/',
          'VALOR MEDIO CONTROL UMA 34':
            '/root/respaldo/UG65P1/valor medio control UMA 34/',
        };

        const fecha = new Date(Date.now() - 3 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        console.log(nombreSensor);
        const nombreArchivo: string = `${nombreSensor.replace(/ /g, '_')}-${fecha}-Web.txt`;
        console.log(nombreArchivo);
        const directorioBase =
          rutasPersonalizadas[nombreSensor] || '/root/respaldo/otros/';
        console.log(directorioBase);
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

  ////////////////////////////////////////////////
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
  async descargarRespaldoGateway(
    downloadGatewayDto: DownloadGatewayDto,
    res: Response,
  ) {
    const { gateway, sensor, archivo } = downloadGatewayDto;
    const sftp = new SftpClient();

    try {
      await sftp.connect({
        host: this.configService.get('FTP_HOST'),
        port: this.configService.get('FTP_PORT'),
        username: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
      });

      const remoteFilePath = `/root/respaldo/${gateway}/${sensor}/${archivo}`;

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

  async test() {
    const url = 'http://127.0.0.1:5678/webhook-test/test';

    const payload = {
      message: '¡Hola desde NestJS!',
      date: new Date().toISOString(),
    };

    try {
      const response$ = this.httpService.post(url, payload);
      const response = await lastValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error(
        'Error al hacer la petición HTTP:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }
}
