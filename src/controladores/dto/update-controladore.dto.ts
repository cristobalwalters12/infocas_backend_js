import { PartialType } from '@nestjs/mapped-types';
import { CreateControladoreDto } from './create-controladore.dto';

export class UpdateControladoreDto extends PartialType(CreateControladoreDto) {}
