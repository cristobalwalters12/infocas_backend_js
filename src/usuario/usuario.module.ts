import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DecodeBase64Middleware } from 'src/common/middlewares/decode-base64.middleware';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Usuario]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

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
  exports: [TypeOrmModule, UsuarioService, JwtStrategy, PassportModule],
})
export class UsuarioModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DecodeBase64Middleware)
      .forRoutes({ path: 'usuario/login', method: RequestMethod.POST });
  }
}
