import { Module } from '@nestjs/common';
import { LoggerDaoService } from './logger-dao/logger-dao.service';
import { LoggingController } from './logging.controller';
import { loggerFactory, APP_LOGGER } from './logger.factory';
import { LoggingService } from './logging.service';
import { PreferencesModule } from '../preferences';
import { logLevelsFactory } from './log-levels.factory';

@Module({
  providers: [
    LoggerDaoService,
    logLevelsFactory,
    loggerFactory,
    LoggingService,
  ],
  imports: [
    PreferencesModule,
  ],
  controllers: [
    LoggingController
  ],
  exports: [
    APP_LOGGER,
  ]
})
export class LoggingModule { }
