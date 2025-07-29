import { PartialType } from '@nestjs/mapped-types';
import { CreateSensoresBackupPresionDiferencialDto } from './create-sensores_backup_presion_diferencial.dto';

export class UpdateSensoresBackupPresionDiferencialDto extends PartialType(CreateSensoresBackupPresionDiferencialDto) {}
