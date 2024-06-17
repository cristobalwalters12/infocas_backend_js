import { Controller, Post, Body } from '@nestjs/common';
import { SensoresBackupService } from './sensores-backup.service';
import { CreateSensoresBackupDto } from './dto/create-sensores-backup.dto';

@Controller('sensores-backup')
export class SensoresBackupController {
  constructor(private readonly sensoresBackupService: SensoresBackupService) {}

  @Post()
  create(@Body() createSensoresBackupDto: CreateSensoresBackupDto) {
    return this.sensoresBackupService.create(createSensoresBackupDto);
  }
}
