import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SensoresBackupPresionDiferencialService } from './sensores_backup_presion_diferencial.service';
import { CreateSensoresBackupPresionDiferencialDto } from './dto/create-sensores_backup_presion_diferencial.dto';
import { UpdateSensoresBackupPresionDiferencialDto } from './dto/update-sensores_backup_presion_diferencial.dto';

@Controller('sensores-backup-presion-diferencial')
export class SensoresBackupPresionDiferencialController {
  constructor(private readonly sensoresBackupPresionDiferencialService: SensoresBackupPresionDiferencialService) {}

  @Post()
  create(@Body() createSensoresBackupPresionDiferencialDto: CreateSensoresBackupPresionDiferencialDto) {
    return this.sensoresBackupPresionDiferencialService.create(createSensoresBackupPresionDiferencialDto);
  }

  @Get()
  findAll() {
    return this.sensoresBackupPresionDiferencialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensoresBackupPresionDiferencialService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSensoresBackupPresionDiferencialDto: UpdateSensoresBackupPresionDiferencialDto) {
    return this.sensoresBackupPresionDiferencialService.update(+id, updateSensoresBackupPresionDiferencialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sensoresBackupPresionDiferencialService.remove(+id);
  }
}
