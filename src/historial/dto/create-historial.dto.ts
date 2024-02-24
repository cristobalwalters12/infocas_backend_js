import { IsNotEmpty, IsString } from 'class-validator';
export class CreateHistorialDto {
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
