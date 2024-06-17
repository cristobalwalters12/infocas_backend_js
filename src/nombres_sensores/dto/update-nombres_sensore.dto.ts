import { PartialType } from '@nestjs/mapped-types';
import { CreateNombresSensoreDto } from './create-nombres_sensore.dto';

export class UpdateNombresSensoreDto extends PartialType(
  CreateNombresSensoreDto,
) {}
