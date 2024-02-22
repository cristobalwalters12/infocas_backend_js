import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class LoginUserDto {
  @IsOptional()
  nombre?: string;
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  correo: string;
  @IsNotEmpty()
  @IsString()
  contraseña: string;
}
