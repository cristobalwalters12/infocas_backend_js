import { Module } from '@nestjs/common';
import { HistorialPresionDiferencialService } from './historial_presion_diferencial.service';
import { HistorialPresionDiferencialController } from './historial_presion_diferencial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialPresionDiferencial } from './entities/historial_presion_diferencial.entity';
@Module({
  imports: [TypeOrmModule.forFeature([HistorialPresionDiferencial])],
  controllers: [HistorialPresionDiferencialController],
  providers: [HistorialPresionDiferencialService],
})
export class HistorialPresionDiferencialModule {}
