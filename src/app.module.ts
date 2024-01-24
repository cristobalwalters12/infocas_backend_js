import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensoresModule } from './sensores/sensores.module';
import { UsuarioModule } from './usuario/usuario.module';
import { NombresSensoresModule } from './nombres_sensores/nombres_sensores.module';
import { PingService } from './common/services/Ping.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: parseInt(configService.get('DATABASE_PORT')),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: configService.get('DATABASE_RECONNECT_INTERVAL'),
        retryAttempts: configService.get('DATABASE_RETRY_ATTEMPTS'),
        retryDelay: configService.get('DATABASE_RETRY_DELAY'),
        extra: {
          connectionLimit: configService.get('DATABASE_CONNECTION_LIMIT'),
          connectTimeout: configService.get('DATABASE_CONNECTION_TIMEOUT'),
          acquireTimeout: configService.get('DATABASE_ACQUIRE_TIMEOUT'),
        },
      }),
    }),
    SensoresModule,
    UsuarioModule,
    NombresSensoresModule,
  ],
  controllers: [],
  providers: [PingService],
})
export class AppModule {}
