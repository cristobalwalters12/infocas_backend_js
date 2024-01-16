import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  correo: string;
  @IsNotEmpty()
  @IsString()
  contraseña: string;
}
