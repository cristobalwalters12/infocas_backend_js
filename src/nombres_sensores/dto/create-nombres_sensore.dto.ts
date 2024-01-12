import { IsNotEmpty, IsString } from 'class-validator';
export class CreateNombresSensoreDto {
  @IsNotEmpty()
  @IsString()
  nombre_sensor: string;
}
