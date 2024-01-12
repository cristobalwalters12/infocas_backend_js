import { Module } from '@nestjs/common';
import { NombresSensoresService } from './nombres_sensores.service';
import { NombresSensoresController } from './nombres_sensores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NombresSensore } from './entities/nombres_sensore.entity';
@Module({
  controllers: [NombresSensoresController],
  providers: [NombresSensoresService],
  imports: [TypeOrmModule.forFeature([NombresSensore])],
})
export class NombresSensoresModule {}
