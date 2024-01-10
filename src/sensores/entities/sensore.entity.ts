/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity('sensores')
export class Sensores {
    @PrimaryGeneratedColumn()
    numero_registro: number;

    @Column('float')
    temperatura: number;

    @Column('float')
    humedad: number;

    @Column('date')
    fecha: Date;

    @Column('time')
    hora: string;
}
