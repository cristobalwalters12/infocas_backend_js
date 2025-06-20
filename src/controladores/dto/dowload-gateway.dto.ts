import { IsNotEmpty, IsString } from 'class-validator';
export class DownloadGatewayDto {
  @IsNotEmpty()
  @IsString()
  gateway: string;
  @IsNotEmpty()
  @IsString()
  sensor: string;
  @IsNotEmpty()
  @IsString()
  archivo: string;
}
