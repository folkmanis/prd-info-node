import { ConsoleLogger } from '@nestjs/common';

export class ConsoleTransport extends ConsoleLogger {
    debug = console.log;
}