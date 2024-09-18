import { Module } from '@nestjs/common';
import { SensoresBackupService } from './sensores-backup.service';
import { SensoresBackupController } from './sensores-backup.controller';
import { SensoresModule } from '../sensores/sensores.module';
import { NombresSensoresModule } from '../nombres_sensores/nombres_sensores.module';

@Module({
  controllers: [SensoresBackupController],
  providers: [SensoresBackupService, SensoresBackupController],
  imports: [SensoresModule, NombresSensoresModule],
})
export class SensoresBackupModule {}
