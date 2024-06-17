import { Injectable } from '@nestjs/common';
import { CreateSensoresBackupDto } from './dto/create-sensores-backup.dto';
import { NombresSensoresService } from '../nombres_sensores/nombres_sensores.service';
import { SensoresService } from '../sensores/sensores.service';
import { writeFile, unlink } from 'fs/promises';
import * as SftpClient from 'ssh2-sftp-client';

@Injectable()
export class SensoresBackupService {
  constructor(
    private sensoresService: SensoresService,
    private nombresSensoresService: NombresSensoresService,
  ) {}

  async create(createSensoresBackupDto: CreateSensoresBackupDto) {
    const { nombreSensor, startDateTime, endDateTime } =
      createSensoresBackupDto;
    const sensor = await this.nombresSensoresService.findOne(nombreSensor);
    const nombre_sensor = sensor.nombre_sensor;
    const informacion_sensor = await this.sensoresService.findRangeInformation({
      nombreSensor: nombre_sensor,
      startDateTime,
      endDateTime,
    });
    const data = JSON.stringify(informacion_sensor, null, 2);
    const filename = nombre_sensor + '.txt';
    await writeFile(filename, data);
    const sftp = new SftpClient();
    try {
      await sftp.connect({
        host: '172.105.150.78',
        port: 22,
        username: 'root',
        password: 'controlas1883',
      });
      await sftp.put(filename, '/root/respaldo/pruebas/' + filename);
      console.log('Archivo subido exitosamente');
      await unlink(filename);
      return 'Archivo subido exitosamente';
    } catch (err) {
      console.error(err);
      return err;
    } finally {
      await sftp.end();
    }
  }
}
