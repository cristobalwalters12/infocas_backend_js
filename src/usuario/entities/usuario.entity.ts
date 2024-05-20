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
}
