import { Injectable } from '@nestjs/common';
import { CreateHistorialPresionDiferencialDto } from './dto/create-historial_presion_diferencial.dto';
import { UpdateHistorialPresionDiferencialDto } from './dto/update-historial_presion_diferencial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialPresionDiferencial } from './entities/historial_presion_diferencial.entity';
@Injectable()
export class HistorialPresionDiferencialService {
  constructor(
    @InjectRepository(HistorialPresionDiferencial)
    private readonly historialPresionDiferencialRepository: Repository<HistorialPresionDiferencial>,
  ) {}

  create(
    createHistorialPresionDiferencialDto: CreateHistorialPresionDiferencialDto,
  ) {
    const historialPresionDiferencial =
      this.historialPresionDiferencialRepository.create(
        createHistorialPresionDiferencialDto,
      );
    return this.historialPresionDiferencialRepository.save(
      historialPresionDiferencial,
    );
  }

  async findAll() {
    const query =
      'SELECT * FROM historial_presion_diferencial ORDER BY fecha DESC';
    const result =
      await this.historialPresionDiferencialRepository.query(query);
    return result.map((item: any) => {
      if (item.fecha) {
        item.fecha = new Date(item.fecha).toISOString().split('T')[0];
      }
      return item;
    });
  }

  findOne(id: number) {
    return this.historialPresionDiferencialRepository.findOneBy({ id });
  }

  update(
    id: number,
    updateHistorialPresionDiferencialDto: UpdateHistorialPresionDiferencialDto,
  ) {
    return this.historialPresionDiferencialRepository.update(
      id,
      updateHistorialPresionDiferencialDto,
    );
  }

  remove(id: number) {
    return this.historialPresionDiferencialRepository.delete(id);
  }
}
