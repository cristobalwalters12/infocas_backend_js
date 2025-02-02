import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RetryInterceptor } from './common/interceptors/retry.interceptors';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new RetryInterceptor());
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.get('CORS_ORIGIN').split(','),
    credentials: true,
  });

  const connectSources = [
    "'self'",
    'http://localhost:3000',
    'ws://localhost:3000',
    'https://infocasbackendjs-production.up.railway.app',
    'wss://infocasbackendjs-production.up.railway.app',
  ];
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          connectSrc: connectSources,
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT);
  logger.log(`Application is running on: ${process.env.PORT}`);
}
bootstrap();
