import { Injectable } from '@nestjs/common';
import { CreateSensoresBackupPresionDiferencialDto } from './dto/create-sensores_backup_presion_diferencial.dto';
import { UpdateSensoresBackupPresionDiferencialDto } from './dto/update-sensores_backup_presion_diferencial.dto';

@Injectable()
export class SensoresBackupPresionDiferencialService {
  create(createSensoresBackupPresionDiferencialDto: CreateSensoresBackupPresionDiferencialDto) {
    return 'This action adds a new sensoresBackupPresionDiferencial';
  }

  findAll() {
    return `This action returns all sensoresBackupPresionDiferencial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sensoresBackupPresionDiferencial`;
  }

  update(id: number, updateSensoresBackupPresionDiferencialDto: UpdateSensoresBackupPresionDiferencialDto) {
    return `This action updates a #${id} sensoresBackupPresionDiferencial`;
  }

  remove(id: number) {
    return `This action removes a #${id} sensoresBackupPresionDiferencial`;
  }
}
