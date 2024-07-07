import { Module } from '@nestjs/common';
import { LoggerDaoService } from './logger-dao/logger-dao.service.js';
import { LoggingController } from './logging.controller.js';
import { loggerFactory, APP_LOGGER } from './logger.factory.js';
import { LoggingService } from './logging.service.js';
import { PreferencesModule } from '../preferences/index.js';
import { logLevelsFactory } from './log-levels.factory.js';
import { APP_FILTER } from '@nestjs/core';
import { ErrorLoggerFilter } from './error-logger.filter.js';

@Module({
  providers: [
    LoggerDaoService,
    logLevelsFactory,
    loggerFactory,
    LoggingService,
    {
      provide: APP_FILTER,
      useClass: ErrorLoggerFilter,
    },
  ],
  imports: [PreferencesModule],
  controllers: [LoggingController],
  exports: [APP_LOGGER],
})
export class LoggingModule { }
