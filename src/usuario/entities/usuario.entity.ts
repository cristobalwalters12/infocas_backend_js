import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  nombre: string;

  @Column('varchar')
  correo: string;

  @Column('varchar')
  contraseña: string;

  @Column('varchar')
  rol: string;

  @Column('boolean', { default: false })
  vista_sensores: boolean;

  @Column('boolean', { default: false })
  vista_dashboard: boolean;

  @Column('boolean', { default: false })
  vista_sensores_presion_diferencial: boolean;

  @Column('boolean', { default: false })
  vista_dashboard_presion_diferencial: boolean;
}
