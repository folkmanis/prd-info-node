import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LoginModule } from './login/login.module';
import { SessionModule } from './session/session.module';
import Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                PORT: Joi.number().default(3000),
                SESSION_EXPIRES: Joi.number().default(86400),
                DB_SRV: Joi.string().required(),
                LOGFILE: Joi.string().default('./error.log'),
                BODY_SIZE_LIMIT: Joi.string().default('5mb'),
                DEBUG: Joi.boolean().truthy('1', 'Y').falsy('0', 'N'),
                JOBS_INPUT: Joi.string().required(),
                FTP_FOLDER: Joi.string().required(),
            }),
            cache: true,
        }),
        DatabaseModule,
        LoginModule,
        SessionModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
