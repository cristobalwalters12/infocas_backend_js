import { IsString } from 'class-validator';

export class FindRespaldoControladoresPreDifDto {
  @IsString()
  controlador: string;
}
