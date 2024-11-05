import { IsNotEmpty, IsString } from 'class-validator';
export class DownloadControladorDto {
  @IsNotEmpty()
  @IsString()
  controlador: string;
  @IsNotEmpty()
  @IsString()
  archivo: string;
}
