import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ControladoresPresionDiferencial } from '../../controladores_presion_diferencial/entities/controladores_presion_diferencial.entity';
import { SensoresPresionDiferencial } from '../../sensores_presion_diferencial/entities/sensores_presion_diferencial.entity';

@Entity('nombres_sensores_pre_dif')
export class NombreSensoresPresionDiferencial {
  @PrimaryGeneratedColumn()
  id_sensor: number;

  @Column('varchar')
  nombre_sensor_pre_dif: string;

  @OneToMany(
    () => SensoresPresionDiferencial,
    (sensoresPresionDiferencial) =>
      sensoresPresionDiferencial.nombre_sensor_presion_diferencial,
  )
  controlador_pre_dif_id: SensoresPresionDiferencial[];

  @ManyToOne(
    () => ControladoresPresionDiferencial,
    (controlador) => controlador.nombresSensoresPresionDiferencial,
  )
  @JoinColumn({ name: 'controlador_pre_dif_id' })
  controlador: ControladoresPresionDiferencial;
}
