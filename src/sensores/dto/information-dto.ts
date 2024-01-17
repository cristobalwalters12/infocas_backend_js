import { IsNumber, IsString } from 'class-validator';

export class InformationDto {
  @IsNumber()
  id_sensor: number;

  @IsString()
  startDateTime: string;

  @IsString()
  endDateTime: string;
}
