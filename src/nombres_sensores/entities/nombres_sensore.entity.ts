import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('nombres_sensores')
export class NombresSensore {
  @PrimaryGeneratedColumn()
  id_sensor: number;

  @Column('varchar')
  nombre_sensor: string;
}
