import { Provider } from '@nestjs/common';
import { LoggerDaoService } from './logger-dao/logger-dao.service.js';
import { LoggingService } from './logging.service.js';
import { ConsoleTransport } from './transports/console.transport.js';
import { MongoTransport } from './transports/mongo.transport.js';
import { AppLogLevels } from '../preferences/index.js';

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
