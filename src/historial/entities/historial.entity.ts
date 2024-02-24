import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity('historial')
export class Historial {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  responsable: string;

  @Column('varchar')
  fecha: string;

  @Column('varchar')
  nombre_archivo: string;
}
