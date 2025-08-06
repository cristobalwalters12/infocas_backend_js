import { Module } from '@nestjs/common';
import { SensoresPresionDiferencialService } from './sensores_presion_diferencial.service';
import { SensoresPresionDiferencialController } from './sensores_presion_diferencial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensoresPresionDiferencial } from './entities/sensores_presion_diferencial.entity';
import { NombreSensoresPresionDiferencialModule } from 'src/nombre_sensores_presion_diferencial/nombre_sensores_presion_diferencial.module';

@Module({
  controllers: [SensoresPresionDiferencialController],
  providers: [SensoresPresionDiferencialService],
  imports: [
    TypeOrmModule.forFeature([SensoresPresionDiferencial]),
    NombreSensoresPresionDiferencialModule,
  ],
  exports: [SensoresPresionDiferencialService],
})
export class SensoresPresionDiferencialModule {}
