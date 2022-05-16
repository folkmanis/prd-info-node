import { Provider } from '@nestjs/common';
import { LoggerDaoService } from './logger-dao/logger-dao.service';
import { LoggingService } from './logging.service';
import { ConsoleTransport } from './transports/console.transport';
import { MongoTransport } from './transports/mongo.transport';
import { AppLogLevels } from '../preferences';

export const APP_LOGGER = 'APP_LOGGER';

export const loggerFactory: Provider = {
  provide: APP_LOGGER,
  useFactory: async (daoService: LoggerDaoService, logLevels: AppLogLevels) =>
    new LoggingService([
      new ConsoleTransport('App', { timestamp: true }),
      new MongoTransport(daoService, logLevels, { level: 'info' }),
    ]),
  inject: [LoggerDaoService, 'LOG_LEVELS'],
};
