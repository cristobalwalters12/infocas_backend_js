import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class PingService implements OnModuleInit {
  constructor(@InjectEntityManager() private entityManager: EntityManager) {}

  async onModuleInit() {
    setInterval(async () => {
      try {
        await this.entityManager.query('SELECT 1');
        console.log('Ping exitoso');
      } catch (error) {
        console.error(`Error en el ping: ${error.message}`);
      }
    }, 60000);
  }
}
