import { PartialType } from '@nestjs/mapped-types';
import { CreateSensoresBackupDto } from './create-sensores-backup.dto';

export class UpdateSensoresBackupDto extends PartialType(
  CreateSensoresBackupDto,
) {}
