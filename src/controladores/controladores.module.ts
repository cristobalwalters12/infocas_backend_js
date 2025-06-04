import { Module } from '@nestjs/common';
import { ControladoresService } from './controladores.service';
import { ControladoresController } from './controladores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controlador } from './entities/controladore.entity';
import { SensoresModule } from 'src/sensores/sensores.module';
import { NombresSensoresModule } from 'src/nombres_sensores/nombres_sensores.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  controllers: [ControladoresController],
  providers: [ControladoresService],
  imports: [
    TypeOrmModule.forFeature([Controlador]),
    SensoresModule,
    NombresSensoresModule,
    HttpModule,
  ],
  exports: [ControladoresService],
})
export class ControladoresModule {}
