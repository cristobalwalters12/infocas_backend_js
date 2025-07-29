import { PartialType } from '@nestjs/mapped-types';
import { CreateControladoresPresionDiferencialDto } from './create-controladores_presion_diferencial.dto';

export class UpdateControladoresPresionDiferencialDto extends PartialType(
  CreateControladoresPresionDiferencialDto,
) {}
