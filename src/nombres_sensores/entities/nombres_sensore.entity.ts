import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Sensores } from '../../sensores/entities/sensore.entity';

@Entity('nombres_sensores')
export class NombresSensore {
  @PrimaryGeneratedColumn()
  id_sensor: number;

  @Column('varchar')
  nombre_sensor: string;

  @OneToMany(() => Sensores, (sensores) => sensores.nombresSensore)
  sensores: Sensores[];
}
