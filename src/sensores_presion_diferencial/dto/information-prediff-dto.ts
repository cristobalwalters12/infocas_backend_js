import { IsString } from 'class-validator';

export class InformationDiferencialDto {
  @IsString()
  nombreSensorPresionDiferencial: string;

  @IsString()
  startDateTime: string;

  @IsString()
  endDateTime: string;
}
