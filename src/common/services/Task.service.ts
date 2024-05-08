import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SensoresService } from '../../sensores/sensores.service';
import { NombresSensoresService } from '../../nombres_sensores/nombres_sensores.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TaskService {
  constructor(
    private sensoresService: SensoresService,
    private nombresSensoresService: NombresSensoresService,
    private configService: ConfigService,
  ) {}

  @Cron('0 15 1 * *  1-5')
  async MailJob() {
    try {
      const sensores = await this.nombresSensoresService.findAll();
      const yesterday: Date = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate: string = yesterday.toISOString().split('T')[0];
      const hourStart: string = '00:01:00';
      const hourEnd: string = '00:30:00';
      const sensoresSinDatos: string[] = [];
      const sensoressinDatosId: number[] = [];
      const dataForHTML = [];
      for (const sensor of sensores) {
        const result = await this.sensoresService.findRangeInformation({
          nombreSensor: sensor.nombre_sensor,
          startDateTime: formattedDate + ' ' + hourStart,
          endDateTime: formattedDate + ' ' + hourEnd,
        });
        if (result.length > 0) {
          console.log(result);
        } else {
          sensoresSinDatos.push(sensor.nombre_sensor);
          sensoressinDatosId.push(sensor.id_sensor);
        }
      }
      for (const id of sensoressinDatosId) {
        const resultsId =
          await this.nombresSensoresService.findLastHourRegisters(id);
        dataForHTML.push(resultsId[0]);
        console.log(resultsId);
      }
      if (sensoresSinDatos.length && sensoressinDatosId.length > 0) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: this.configService.get('EMAIL_USER'),
            pass: this.configService.get('EMAIL_PASS'),
          },
        });
        const mailOptions = {
          from: 'infocasalerta@gmail.com',
          to: 'cristobalwalters@gmail.com', // destinatario
          subject: 'Sensores sin datos', // Asunto
          html: `
              <h1>Sensores sin datos</h1>
              <p>se hizo un analisis de los datos de la fecha ${formattedDate} con horas entre ${hourStart} y ${hourEnd} para ver los ultimos Registros ingresados</p>
              <p>y se detecto que no se ha encontrado informacion en los siguientes sensores: </p>
              <table>
                <tr>
                  <th>Nombre del sensor</th>
                </tr>
                ${sensoresSinDatos
                  .map(
                    (sensor, i) =>
                      `<tr><td>${sensor}</td><td>${
                        new Date(dataForHTML[i].fecha)
                          .toISOString()
                          .split('T')[0]
                      }</td><td>${dataForHTML[i].hora}</td></tr>`,
                  )
                  .join('')}
                
              </table>
            `,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email enviado: ' + info.response);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}
