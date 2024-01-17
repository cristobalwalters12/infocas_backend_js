import { IsString, IsNumber } from 'class-validator';

export class CreateSensoreDto {
  @IsNumber()
  temperatura: number;

  @IsNumber()
  id_sensor: number;

  @IsNumber()
  humedad: number;

  @IsString()
  fecha: Date;

  @IsString()
  hora: string;
}
