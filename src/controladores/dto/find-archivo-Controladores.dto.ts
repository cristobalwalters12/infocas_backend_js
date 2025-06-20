import { IsString } from 'class-validator';

export class FindArchivoRespaldoControladoresDto {
  @IsString()
  controlador: string;
  @IsString()
  carpeta: string;
}
