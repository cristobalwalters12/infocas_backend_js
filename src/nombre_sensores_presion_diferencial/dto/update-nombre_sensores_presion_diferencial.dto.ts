import { PartialType } from '@nestjs/mapped-types';
import { CreateNombreSensoresPresionDiferencialDto } from './create-nombre_sensores_presion_diferencial.dto';

export class UpdateNombreSensoresPresionDiferencialDto extends PartialType(CreateNombreSensoresPresionDiferencialDto) {}
