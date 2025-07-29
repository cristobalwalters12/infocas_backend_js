import { IsNotEmpty, IsString } from 'class-validator';
export class CreateHistorialPresionDiferencialDto {
  @IsNotEmpty()
  @IsString()
  responsable: string;

  @IsNotEmpty()
  @IsString()
  fecha: string;

  @IsNotEmpty()
  @IsString()
  nombre_archivo: string;
}
