import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Gabits API')
    .setDescription('Gabits goal & habit tracking API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  const swaggerPath = 'api-docs';
  app.use(`/${swaggerPath}`, (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });
  SwaggerModule.setup(swaggerPath, app, doc, {
    customSiteTitle: 'Gabits API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
  });

  await app.listen(3000, '0.0.0.0');
  new Logger('Bootstrap').log('Gabits API running on :3000');
}
bootstrap();
