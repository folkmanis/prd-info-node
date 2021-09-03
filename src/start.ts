import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { parseInstanceId } from './lib/instance-id-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app: NestExpressApplication = await NestFactory.create(AppModule);

    const maxBodySize = app.get(ConfigService).get('BODY_SIZE_LIMIT');
    app.use(json({ limit: maxBodySize }));

    app.use(urlencoded({ extended: true }));

    app.setGlobalPrefix('data');
    app.use(parseInstanceId());

    const port = app.get(ConfigService).get('PORT');
    await app.listen(port);
}
bootstrap();
