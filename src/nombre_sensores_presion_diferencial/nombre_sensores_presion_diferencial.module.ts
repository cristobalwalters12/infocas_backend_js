import { Module } from '@nestjs/common';
import { NombreSensoresPresionDiferencialService } from './nombre_sensores_presion_diferencial.service';
import { NombreSensoresPresionDiferencialController } from './nombre_sensores_presion_diferencial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NombreSensoresPresionDiferencial } from './entities/nombre_sensores_presion_diferencial.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../usuario/strategies/jwt.strategy';
import { Usuario } from '../usuario/entities/usuario.entity';
import { SensoresPresionDiferencialGateway } from './nombre_sensores_presion_diferencial.gateway';
@Module({
  controllers: [NombreSensoresPresionDiferencialController],
  providers: [
    NombreSensoresPresionDiferencialService,
    JwtStrategy,
    SensoresPresionDiferencialGateway,
  ],
  imports: [
    TypeOrmModule.forFeature([NombreSensoresPresionDiferencial, Usuario]),
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
  exports: [NombreSensoresPresionDiferencialService],
})
export class NombreSensoresPresionDiferencialModule {}
