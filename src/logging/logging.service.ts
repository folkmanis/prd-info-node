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
      .map((transport) => transport.debug)
      .filter((debug) => !!debug)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .forEach((debug) => debug!(message, ...meta));
  }
  verbose(message: any, ...meta: [...any, string?]) {
    this.transports
      .map((transport) => transport.verbose)
      .filter((verbose) => !!verbose)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .forEach((verbose) => verbose!(message, ...meta));
  }
}
