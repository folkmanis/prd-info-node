import { Module } from '@nestjs/common';
import { PreferencesModule } from '../preferences/index.js';
import { logLevelsFactory } from './log-levels.factory.js';
import { LoggerDaoService } from './logger-dao/logger-dao.service.js';
import { APP_LOGGER, loggerFactory } from './logger.factory.js';
import { LoggingController } from './logging.controller.js';
import { LoggingService } from './logging.service.js';
import { provideLogCollection } from './logger-dao/log-collection.provider.js';

@Module({
  providers: [
    provideLogCollection,
    LoggerDaoService,
    logLevelsFactory,
    loggerFactory,
    LoggingService,
  ],
  imports: [PreferencesModule],
  controllers: [LoggingController],
  exports: [APP_LOGGER],
})
export class LoggingModule {}
