import { Module } from '@nestjs/common';
import { SensoresBackupPresionDiferencialService } from './sensores_backup_presion_diferencial.service';
import { SensoresBackupPresionDiferencialController } from './sensores_backup_presion_diferencial.controller';

@Module({
  controllers: [SensoresBackupPresionDiferencialController],
  providers: [SensoresBackupPresionDiferencialService],
})
export class SensoresBackupPresionDiferencialModule {}
