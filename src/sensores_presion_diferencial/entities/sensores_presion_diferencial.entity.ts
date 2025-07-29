import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { NombreSensoresPresionDiferencial } from '../../nombre_sensores_presion_diferencial/entities/nombre_sensores_presion_diferencial.entity';

@Entity('sensores_pre_dif')
export class SensoresPresionDiferencial {
  @PrimaryGeneratedColumn()
  numero_registro: number;

  @ManyToOne(() => NombreSensoresPresionDiferencial)
  @JoinColumn({ name: 'id_sensor', referencedColumnName: 'id_sensor' })
  nombre_sensor_presion_diferencial: NombreSensoresPresionDiferencial;

  @Column('float')
  Dif_Ch1: number;

  @Column('float')
  Dif_Ch2: number;

  @Column('date')
  fecha: Date;

  @Column('time')
  hora: string;

  @Column()
  id_sensor: number;
}
