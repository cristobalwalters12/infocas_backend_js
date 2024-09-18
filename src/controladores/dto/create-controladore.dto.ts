import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
export class CreateControladoreDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  @IsString()
  controlador: string;
}
