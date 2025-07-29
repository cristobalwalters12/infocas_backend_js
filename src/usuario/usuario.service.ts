import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto, UpdateUsuarioDto, LoginUserDto } from './dto';
import { TurnstileService } from '../common/services/reCAPTCHA.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt.payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly recaptchaService: TurnstileService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const { contraseña, ...userData } = createUsuarioDto;
      const usuario = this.usuarioRepository.create({
        ...userData,
        contraseña: contraseña,
      });
      const existingUser = await this.usuarioRepository.findOne({
        where: { correo: usuario.correo },
      });

      if (existingUser) {
        throw new HttpException('El email ya existe', HttpStatus.BAD_REQUEST);
      }

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  async login(loginUserDto: LoginUserDto) {
    try {
      const { contraseña, correo, turnstileToken } = loginUserDto;

      await this.recaptchaService.validateToken(turnstileToken);
      const usuario = await this.usuarioRepository.findOne({
        where: { correo: correo },
        select: [
          'correo',
          'contraseña',
          'nombre',
          'rol',
          'vista_dashboard',
          'vista_sensores',
          'vista_dashboard_presion_diferencial',
          'vista_sensores_presion_diferencial',
        ],
      });

      if (!usuario) {
        throw new UnauthorizedException('las credenciales no son validas');
      }

      const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);

      if (!isMatch && contraseña !== usuario.contraseña) {
        throw new UnauthorizedException('La contraseña es incorrecta');
      }
      delete usuario.contraseña;
      return {
        ...usuario,

        token: this.getJwtToken({ correo: usuario.correo }),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findAll() {
    try {
      return await this.usuarioRepository.find();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const usuario = await this.usuarioRepository.findOne({ where: { id } });

      if (!usuario) {
        throw new HttpException('El usuario no existe', HttpStatus.NOT_FOUND);
      }

      return usuario;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const result = await this.usuarioRepository.update(id, updateUsuarioDto);

      if (result.affected === 0) {
        throw new HttpException('El usuario no existe', HttpStatus.NOT_FOUND);
      }

      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.usuarioRepository.delete(id);

      if (result.affected === 0) {
        throw new HttpException('El usuario no existe', HttpStatus.NOT_FOUND);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
