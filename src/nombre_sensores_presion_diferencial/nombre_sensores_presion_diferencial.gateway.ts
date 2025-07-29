import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NombreSensoresPresionDiferencialService } from './nombre_sensores_presion_diferencial.service';
import { Cron } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: '/SupervisionSensoresPresionDiferencial',
  cors: {
    origin: (requestOrigin, callback) => {
      const corsOrigins = new ConfigService().get('CORS_ORIGIN').split(',');
      if (corsOrigins.includes(requestOrigin) || !requestOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class SensoresPresionDiferencialGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SensoresPresionDiferencialGateway.name);

  constructor(
    private readonly nombresSensoresService: NombreSensoresPresionDiferencialService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket de sensores de presion diferencial initialized');
  }

  // Cuando un cliente se conecta, enviamos los datos automáticamente
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.sendSensorDataToClient(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async sendSensorDataToClient(client: Socket) {
    try {
      const sensorData = await this.nombresSensoresService.findIds();
      client.emit('responseSensorData', sensorData); // Enviar los datos al cliente
    } catch (error) {
      console.error('Error while fetching sensor data:', error);
      client.emit('error', { message: 'Error while fetching sensor data' });
    }
  }

  // Esta función escucha el evento "requestSensorData" que los clientes pueden enviar
  @SubscribeMessage('requestSensorPreDifData')
  async handleSensorData(client: Socket): Promise<void> {
    try {
      const sensorData = await this.nombresSensoresService.findIds();
      client.emit('responseSensorData', sensorData);
    } catch (error) {
      console.error('Error while fetching sensor data:', error);
      client.emit('error', { message: 'Error while fetching sensor data' });
    }
  }

  // Función que envía datos a todos los clientes cada 5 minutos
  @Cron('*/5 * * * *')
  async sendSensorDataToAllClients(): Promise<void> {
    try {
      this.logger.log('Fetching sensor data for all connected clients...');
      const sensorData = await this.nombresSensoresService.findIds();
      this.server.emit('responseSensorData', sensorData); // Enviar los datos a todos los clientes
      this.logger.log('Sensor data sent to all clients');
    } catch (error) {
      this.logger.error('Error while fetching sensor data:', error);
    }
  }
}
