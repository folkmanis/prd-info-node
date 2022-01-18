import { LoggerService } from '@nestjs/common';
import { AppLogLevels, LogLevel } from '../../preferences';
import { LogRecord } from '../interfaces/log-record.interface';
import { LoggerDaoService } from '../logger-dao/logger-dao.service';

interface MongoTransportConfig {
  level: LogLevel;
}

export class MongoTransport implements LoggerService {
  private level: number;

  constructor(
    private loggerDao: LoggerDaoService,
    private logLevels: AppLogLevels,
    config: MongoTransportConfig = {
      level: 'warn',
    },
  ) {
    this.level = logLevels[config.level];
  }

  log(message: any, ...optionalParams: [...any, string?]): void {
    this.writeMessage('info', message, optionalParams);
  }

  error(message: any, ...optionalParams: [...any, string?, string?]): void {
    if (message instanceof Error) {
      const { stack } = message;
      optionalParams = [...optionalParams, stack];
    }
    this.writeMessage('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: [...any, string?]): void {
    this.writeMessage('warn', message, optionalParams);
  }

  debug(message: any, ...optionalParams: [...any, string?]): void {
    this.writeMessage('debug', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: [...any, string?]): void {
    this.writeMessage('verbose', message, optionalParams);
  }

  private writeMessage(level: LogLevel, info: any, metadata: any[]) {
    const levelN = this.logLevels[level];
    if (levelN > this.level) {
      return;
    }
    if (typeof info !== 'string') {
      info = info.toString();
    }
    const record: LogRecord = {
      level: levelN,
      timestamp: new Date(),
      info: info,
      metadata,
    };
    this.loggerDao.insertOne(record);
  }
}
