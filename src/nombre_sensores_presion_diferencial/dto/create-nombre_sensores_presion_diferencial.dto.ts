import { IsNotEmpty, IsString } from 'class-validator';
export class CreateNombreSensoresPresionDiferencialDto {
  @IsNotEmpty()
  @IsString()
  nombre_sensor_pre_dif: string;
}
