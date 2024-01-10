import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsString()
  nombre: string;
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  correo: string;
  @IsNotEmpty()
  @IsString()
  contraseña: string;
}
