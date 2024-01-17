import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NombresSensore } from '../../nombres_sensores/entities/nombres_sensore.entity';

@Entity('sensores')
export class Sensores {
  @PrimaryGeneratedColumn()
  numero_registro: number;

  @ManyToOne(() => NombresSensore)
  @JoinColumn({ name: 'id_sensor', referencedColumnName: 'id_sensor' })
  nombresSensore: NombresSensore;

  @Column('float')
  temperatura: number;

  @Column('float')
  humedad: number;

  @Column('date')
  fecha: Date;

  @Column('time')
  hora: string;

  @Column()
  id_sensor: number;
}
