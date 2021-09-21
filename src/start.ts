import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { APP_LOGGER } from './logging/logger.factory';
import { versionMiddleware } from './preferences';
import { parseInstanceId } from './preferences/instance-id-parser';
import { NullResponseInterceptor } from './lib/null-response.interceptor';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule,
    { bufferLogs: true, }
  );

  const maxBodySize = app.get(ConfigService).get('BODY_SIZE_LIMIT');
  app.use(json({ limit: maxBodySize }));

  app.useLogger(app.get(APP_LOGGER));

  app.use(urlencoded({ extended: true }));

  app.setGlobalPrefix('data');
  app.use(parseInstanceId());
  app.use(versionMiddleware());

  app.useGlobalInterceptors(new NullResponseInterceptor());

  const port = app.get(ConfigService).get('PORT');
  await app.listen(port);
}
bootstrap();
