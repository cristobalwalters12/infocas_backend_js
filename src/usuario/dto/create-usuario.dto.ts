import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsOptional()
  @IsBoolean()
  vista_sensores: boolean;
  @IsOptional()
  @IsBoolean()
  vista_dashboard: boolean;

  @IsOptional()
  @IsBoolean()
  vista_sensores_presion_diferencial: boolean;

  @IsOptional()
  @IsBoolean()
  vista_dashboard_presion_diferencial: boolean;
}
