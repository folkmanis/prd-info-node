import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Modules } from '../login';
import { LogQuery } from './interfaces/log-query.class';
import { LoggerDaoService } from './logger-dao/logger-dao.service';

@Controller('logging')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Modules('admin')
export class LoggingController {
  constructor(private logDao: LoggerDaoService) {}

  @Get('dates-groups')
  async getDatesGroups(@Query() query: LogQuery) {
    return this.logDao.datesGroup(query.toFilter());
  }

  @Get()
  async getEntries(@Query() query: LogQuery) {
    return this.logDao.readAll(query.toFilter());
  }
}
