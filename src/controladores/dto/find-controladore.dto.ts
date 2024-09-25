import { IsNotEmpty,IsString } from "class-validator";
export class FindControladoreDto {
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