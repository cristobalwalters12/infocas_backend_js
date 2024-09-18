import { Injectable } from '@nestjs/common';
import { CreateControladoreDto } from './dto/create-controladore.dto';
import { UpdateControladoreDto } from './dto/update-controladore.dto';
import { Controlador } from './entities/controladore.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ControladoresService {
  constructor(
    @InjectRepository(Controlador)
    private controladorRepository: Repository<Controlador>,
  ) {}
  create(createControladoreDto: CreateControladoreDto) {
    return createControladoreDto;
  }

  async findAll() {
    return await this.controladorRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} controladore`;
  }

  update(id: number, updateControladoreDto: UpdateControladoreDto) {
    return `This action updates a #${id} controladore with ${updateControladoreDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} controladore`;
  }
}
