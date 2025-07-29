import { PartialType } from '@nestjs/mapped-types';
import { CreateSensoresPresionDiferencialDto } from './create-sensores_presion_diferencial.dto';

export class UpdateSensoresPresionDiferencialDto extends PartialType(CreateSensoresPresionDiferencialDto) {}
