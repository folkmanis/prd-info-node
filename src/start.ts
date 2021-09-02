import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
    const app: NestExpressApplication = await NestFactory.create(AppModule);

    app.setGlobalPrefix('data');
    // app.set('trust proxy', true);

    const port = app.get(ConfigService).get('PORT');
    await app.listen(port);
}
bootstrap();
