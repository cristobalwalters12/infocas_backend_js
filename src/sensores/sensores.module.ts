import { Module } from '@nestjs/common';
import { SensoresService } from './sensores.service';
import { SensoresController } from './sensores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensores } from './entities/sensore.entity';
@Module({
  controllers: [SensoresController],
  providers: [SensoresService],
  imports: [TypeOrmModule.forFeature([Sensores])],
})
export class SensoresModule {}
