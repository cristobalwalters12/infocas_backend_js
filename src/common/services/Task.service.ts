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

  @Cron('0 20 5 * *  1-5')
  async MailJob() {
    try {
      const sensores = await this.nombresSensoresService.findAll();
      const yesterday: Date = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate: string = yesterday.toISOString().split('T')[0];
      const hourStart: string = '00:01:00';
      const hourEnd: string = '00:34:00';
      const sensoresSinDatos: string[] = [];
      const sensoressinDatosId: number[] = [];
      const dataForHTML = [];
      for (const sensor of sensores) {
        // se hace la busqueda de datos de los sensores en un rango de horas
        const result = await this.sensoresService.findRangeInformation({
          nombreSensor: sensor.nombre_sensor,
          startDateTime: formattedDate + ' ' + hourStart,
          endDateTime: formattedDate + ' ' + hourEnd,
        });
        // si se encuentra datos en el rango de horas se imprime en consola
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
        console.log('-------------------');
        console.log('sensores sin info actualizada a la fecha ');
        console.log(resultsId);
        console.log('-------------------');
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
          to: 'cristobalwalters@gmail.com',
          subject: 'Alertas de sensor sin temperatura',
          html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Correo Electrónico</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .container {
                    padding: 20px;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                }
                .header {
                    background-color: #f2f2f2;
                    color: black;
                    padding: 10px;
                    text-align: center;
                }
                .content {
                    margin-top: 20px;
                }
                .table {
                    display: flex;
                    justify-content: center;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Sensores sin datos</h1>
                    <div>
                        <img src="https://infocas-js.vercel.app/unnamed1.png" alt="Logo" width="150">   
                    </div>
                </div>
                <div class="content">
                    <p>Se hizo un análisis de los datos de la fecha ${formattedDate} con horas entre ${hourStart} y ${hourEnd} para ver los últimos registros ingresados</p>
                    <p>Y se detectó que no se ha encontrado información en los siguientes sensores: </p>
                    <div class="table">
                      <table>
                        <tr>
                            <th>Nombre del sensor</th>
                            <th>Fecha</th>
                            <th>Hora</th>
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
                    </div>

                </div>
                <div class="footer">
                    <p>&copy; 2024 Infocas. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
          `,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            return error;
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
