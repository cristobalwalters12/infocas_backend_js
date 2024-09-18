import { Module } from '@nestjs/common';
import { ControladoresService } from './controladores.service';
import { ControladoresController } from './controladores.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Controlador } from './entities/controladore.entity';

@Module({
  controllers: [ControladoresController],
  providers: [ControladoresService],
  imports: [TypeOrmModule.forFeature([Controlador])],
})
export class ControladoresModule {}
