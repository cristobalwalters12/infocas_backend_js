import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RetryInterceptor } from './common/interceptors/retry.interceptors';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new RetryInterceptor());
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.get('CORS_ORIGIN').split(','), // this configuration is for develop configService.get('CORS_ORIGIN'),
    credentials: true,
  });

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
