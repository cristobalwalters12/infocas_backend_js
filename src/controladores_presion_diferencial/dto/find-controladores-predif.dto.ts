import { IsNotEmpty, IsString } from 'class-validator';
export class FindControladorePreDifDto {
  @IsNotEmpty()
  @IsString()
  controlador: string;
  @IsString()
  @IsNotEmpty()
  startDateTime: string;
  @IsString()
  @IsNotEmpty()
  endDateTime: string;
}
