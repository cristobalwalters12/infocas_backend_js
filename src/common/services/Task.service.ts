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
  //@Cron('40 0 * 1-12 *')
  @Cron('* * * * *')
  async MailJob() {
    try {
      const sensores = await this.nombresSensoresService.findAll();
      const yesterday: Date = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate: string = yesterday.toISOString().split('T')[0];
      const hourStart: string = '23:01:00';
      const hourEnd: string = '23:30:00';
      const sensoresSinDatos: string[] = [];

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
        }
      }
      if (sensoresSinDatos.length > 0) {
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
              <table>
                <tr>
                  <th>Nombre del sensor</th>
                </tr>
                ${sensoresSinDatos
                  .map((sensor) => `<tr><td>${sensor}</td></tr>`)
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
