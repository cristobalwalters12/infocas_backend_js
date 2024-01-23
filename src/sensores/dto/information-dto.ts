import { IsString } from 'class-validator';

export class InformationDto {
  @IsString()
  nombreSensor: string;

  @IsString()
  startDateTime: string;

  @IsString()
  endDateTime: string;
}
