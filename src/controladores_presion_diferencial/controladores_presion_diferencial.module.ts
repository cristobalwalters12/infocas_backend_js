import { Module } from '@nestjs/common';
import { ControladoresPresionDiferencialService } from './controladores_presion_diferencial.service';
import { ControladoresPresionDiferencialController } from './controladores_presion_diferencial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControladoresPresionDiferencial } from './entities/controladores_presion_diferencial.entity';
import { SensoresPresionDiferencialModule } from '../sensores_presion_diferencial/sensores_presion_diferencial.module';
import { NombreSensoresPresionDiferencialModule } from '../nombre_sensores_presion_diferencial/nombre_sensores_presion_diferencial.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ControladoresPresionDiferencialController],
  providers: [ControladoresPresionDiferencialService],
  imports: [
    TypeOrmModule.forFeature([ControladoresPresionDiferencial]),
    SensoresPresionDiferencialModule,
    NombreSensoresPresionDiferencialModule,
    HttpModule,
  ],
  exports: [ControladoresPresionDiferencialService],
})
export class ControladoresPresionDiferencialModule {}
