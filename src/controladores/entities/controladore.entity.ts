import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { NombresSensore } from '../../nombres_sensores/entities/nombres_sensore.entity';
@Entity('controlador')
export class Controlador {
  @PrimaryColumn()
  id: number;

  @Column('varchar')
  controlador: string;

  @OneToMany(
    () => NombresSensore,
    (nombresSensore) => nombresSensore.controlador,
  )
  nombresSensores: NombresSensore[];
}
