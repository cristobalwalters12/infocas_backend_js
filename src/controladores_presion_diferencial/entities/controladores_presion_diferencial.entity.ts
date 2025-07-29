import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

import { NombreSensoresPresionDiferencial } from '../../nombre_sensores_presion_diferencial/entities/nombre_sensores_presion_diferencial.entity';

@Entity('controlador_pre_dif')
export class ControladoresPresionDiferencial {
  @PrimaryColumn()
  id: number;

  @Column('varchar')
  controlador: string;

  @OneToMany(
    () => NombreSensoresPresionDiferencial,
    (nombreSensoresPresionDiferencial) =>
      nombreSensoresPresionDiferencial.controlador,
  )
  nombresSensoresPresionDiferencial: NombreSensoresPresionDiferencial[];
}
