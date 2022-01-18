import { LoggerService } from '@nestjs/common';

export class LoggingService implements LoggerService {
  constructor(private transports: LoggerService[]) {}

  log(message: any, ...meta: [...any, string?]) {
    this.transports.forEach((transport) => transport.log(message, ...meta));
  }

  error(message: any, ...meta: [...any, string?, string?]): void {
    this.transports.forEach((transport) => transport.error(message, ...meta));
  }

  warn(message: any, ...meta: [...any, string?]) {
    this.transports.forEach((transport) => transport.warn(message, ...meta));
  }
  debug(message: any, ...meta: [...any, string?]) {
    this.transports
      .filter((transport) => transport.debug !== undefined)
      .forEach((transport) => transport.debug!(message, ...meta));
  }
  verbose(message: any, ...meta: [...any, string?]) {
    this.transports
      .filter((transport) => transport.verbose !== undefined)
      .forEach((transport) => transport.verbose!(message, ...meta));
  }
}
