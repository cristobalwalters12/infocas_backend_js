import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SensoresService } from '../../sensores/sensores.service';
import { NombresSensoresService } from '../../nombres_sensores/nombres_sensores.service';
import { ControladoresService } from '../../controladores/controladores.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TaskService {
  constructor(
    private sensoresService: SensoresService,
    private nombresSensoresService: NombresSensoresService,
    private configService: ConfigService,
    private controladoresService: ControladoresService,
  ) {}

  @Cron('0,30 * * * 1-5')
  //@Cron('*/2 * * * 1-5')
  async MailJob() {
    try {
      const timeZone = 'America/Santiago';
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const today = new Date();
      const parts = formatter.formatToParts(today);
      const formattedDate: string = `${parts.find((p) => p.type === 'year')?.value}-${parts.find((p) => p.type === 'month')?.value}-${parts.find((p) => p.type === 'day')?.value}`;
      console.log(`Fecha ajustada a ${timeZone}: ${formattedDate}`);
      const sensores = await this.nombresSensoresService.findAll();
      const now = new Date();
      now.setHours(now.getHours() - 5);
      const hourStart: string = now.toTimeString().split(' ')[0];
      const current = new Date();
      current.setHours(current.getHours() - 4);
      const hourEnd: string = current.toTimeString().split(' ')[0];
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
        console.log('-------------------');
        console.log(
          `Resultado de la búsqueda: ${result.length} registros encontrados`,
        );
        if (result.length > 0) {
          console.log('-------------------');
          console.log(
            `sensores con datos del sensor ${sensor.nombre_sensor} actualizados a la fecha ${formattedDate} con horas entre ${hourStart} y ${hourEnd}`,
          );
          console.log('-------------------');
        } else {
          //if (sensor.nombre_sensor !== 'PATENTE CAMION KGFS86 PR-TGHP-63') {
          sensoresSinDatos.push(sensor.nombre_sensor);
          sensoressinDatosId.push(sensor.id_sensor);
          //}
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
                        <img src="https://www.infocas.cl/Infocas.png" alt="Logo" width="150">   
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
  @Cron('0 20 3 * *  1-7')
  async dataRespaldos() {
    const fecha_fin: Date = new Date();
    const fecha_inicio: Date = new Date();
    fecha_inicio.setDate(fecha_inicio.getDate() - 14);
    const fecha_inicio_str: string = fecha_inicio.toISOString().split('T')[0];
    const fecha_fin_str: string = fecha_fin.toISOString().split('T')[0];

    try {
      const nombres_controladores = await this.controladoresService.findAll();
      const controladores = nombres_controladores
        .filter(
          (controlador) =>
            controlador.id !== 9 && controlador.controlador !== 'UG65',
        )
        .map((controlador) => controlador.controlador);
      for (const controlador of controladores) {
        try {
          await this.controladoresService.respaldarTxt({
            controlador,
            startDateTime: fecha_inicio_str,
            endDateTime: fecha_fin_str,
          });
          console.log(`Respaldo para controlador ${controlador}`);
        } catch (error) {
          console.error(`Error al procesar controlador ${controlador}:`, error);
        }
      }
    } catch (error) {
      console.error('Error al obtener nombres de controladores:', error);
    }
  }
  @Cron('0 30 3 * *  1-7')
  async respaldoSensoresUG65() {
    const fecha_fin: Date = new Date();
    const fecha_inicio: Date = new Date();
    fecha_inicio.setDate(fecha_inicio.getDate() - 14);
    const fecha_inicio_str: string = fecha_inicio.toISOString().split('T')[0];
    const fecha_fin_str: string = fecha_fin.toISOString().split('T')[0];
    const controlador: string = 'UG65';
    try {
      await this.controladoresService.respaldo_Sensores2025({
        controlador,
        startDateTime: fecha_inicio_str,
        endDateTime: fecha_fin_str,
      });
    } catch (error) {
      console.error('Error al obtener nombres de sensores:', error);
    }
  }
  @Cron('0 40 3 * *  1-7')
  async respaldoSensoresUG65P2() {
    const fecha_fin: Date = new Date();
    const fecha_inicio: Date = new Date();
    fecha_inicio.setDate(fecha_inicio.getDate() - 14);
    const fecha_inicio_str: string = fecha_inicio.toISOString().split('T')[0];
    const fecha_fin_str: string = fecha_fin.toISOString().split('T')[0];
    const controlador: string = 'UG65P2';
    try {
      await this.controladoresService.respaldo_Sensores2025({
        controlador,
        startDateTime: fecha_inicio_str,
        endDateTime: fecha_fin_str,
      });
    } catch (error) {
      console.error('Error al obtener nombres de sensores:', error);
    }
  }
}
