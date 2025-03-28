import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
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
  @IsString()
  @IsNotEmpty()
  rol: string;
  @IsNotEmpty()
  @IsBoolean()
  vista_sensores: boolean;
  @IsNotEmpty()
  @IsBoolean()
  vista_dashboard: boolean;
}
