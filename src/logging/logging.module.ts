import { Module } from '@nestjs/common';
import { LoggerDaoService } from './logger-dao/logger-dao.service';
import { LoggingController } from './logging.controller';

@Module({
  providers: [LoggerDaoService],
  controllers: [LoggingController]
})
export class LoggingModule {}
