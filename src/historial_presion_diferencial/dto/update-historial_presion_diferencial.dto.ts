import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialPresionDiferencialDto } from './create-historial_presion_diferencial.dto';

export class UpdateHistorialPresionDiferencialDto extends PartialType(CreateHistorialPresionDiferencialDto) {}
