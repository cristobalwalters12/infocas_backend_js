import { IsString } from 'class-validator';

export class FindRespaldoControladoresDto {
  @IsString()
  controlador: string;
}
