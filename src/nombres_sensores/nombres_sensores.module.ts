import { Module } from '@nestjs/common';
import { NombresSensoresService } from './nombres_sensores.service';
import { NombresSensoresController } from './nombres_sensores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NombresSensore } from './entities/nombres_sensore.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../usuario/strategies/jwt.strategy';
import { Usuario } from '../usuario/entities/usuario.entity';
@Module({
  controllers: [NombresSensoresController],
  providers: [NombresSensoresService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([NombresSensore, Usuario]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '2h' },
        };
      },
    }),
  ],
})
export class NombresSensoresModule {}
