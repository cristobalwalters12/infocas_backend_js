import { Module } from '@nestjs/common';
import { SensoresPresionDiferencialService } from './sensores_presion_diferencial.service';
import { SensoresPresionDiferencialController } from './sensores_presion_diferencial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensoresPresionDiferencial } from './entities/sensores_presion_diferencial.entity';

@Module({
  controllers: [SensoresPresionDiferencialController],
  providers: [SensoresPresionDiferencialService],
  imports: [TypeOrmModule.forFeature([SensoresPresionDiferencial])],
  exports: [SensoresPresionDiferencialService],
})
export class SensoresPresionDiferencialModule {}
