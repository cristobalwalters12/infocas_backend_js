import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sensores } from '../../sensores/entities/sensore.entity';
import { Controlador } from '../../controladores/entities/controladore.entity';

@Entity('nombres_sensores')
export class NombresSensore {
  @PrimaryGeneratedColumn()
  id_sensor: number;

  @Column('varchar')
  nombre_sensor: string;

  @OneToMany(() => Sensores, (sensores) => sensores.nombresSensore)
  sensores: Sensores[];

  @ManyToOne(() => Controlador, (controlador) => controlador.nombresSensores)
  @JoinColumn({ name: 'controlador_id' })
  controlador: Controlador;
}
