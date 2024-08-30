import { Injectable } from '@nestjs/common';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historial } from './entities/historial.entity';
@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private historialRepository: Repository<Historial>,
  ) {}
  async create(createHistorialDto: CreateHistorialDto) {
    const historial = this.historialRepository.create(createHistorialDto);
    return await this.historialRepository.save(historial);
  }

  async findAll() {
    const query = 'SELECT * FROM historial ORDER BY fecha DESC';
    const result = await this.historialRepository.query(query);

    const formattedResult = result.map((item: any) => {
      if (item.fecha) {
        item.fecha = new Date(item.fecha).toISOString().split('T')[0];
      }
      return item;
    });

    return formattedResult;
  }

  findOne(id: number) {
    return `This action returns a #${id} historial`;
  }

  remove(id: number) {
    return `This action removes a #${id} historial`;
  }
}
