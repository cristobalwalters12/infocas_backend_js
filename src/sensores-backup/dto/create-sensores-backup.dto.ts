import { IsOptional, IsString } from 'class-validator';

export class CreateSensoresBackupDto {
  @IsString()
  nombreSensor: number;

  @IsString()
  @IsOptional()
  startDateTime?: string;

  @IsString()
  @IsOptional()
  endDateTime?: string;
}
