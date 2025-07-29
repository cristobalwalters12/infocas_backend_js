import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('historial_presion_diferencial')
export class HistorialPresionDiferencial {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  responsable: string;

  @Column('varchar')
  fecha: string;

  @Column('varchar')
  nombre_archivo: string;
}
