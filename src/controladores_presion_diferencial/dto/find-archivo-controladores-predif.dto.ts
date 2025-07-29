import { IsString } from 'class-validator';

export class FindArchivoRespaldoControladoresPreDifDto {
  @IsString()
  controlador: string;
  @IsString()
  carpeta: string;
}
