import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PingService implements OnModuleInit {
  private readonly logger = new Logger(PingService.name);
  private readonly uuid: string = uuidv4();
  constructor(@InjectEntityManager() private entityManager: EntityManager) {}

  async onModuleInit() {
    setInterval(async () => {
      try {
        await this.entityManager.query('SELECT 1');
        this.logger.log(`Ping Correcto ${this.uuid}`);
      } catch (error) {
        this.logger.error(`Error en el ping: ${this.uuid}`, error);
      }
    }, 60000);
  }
}
