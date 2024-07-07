import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Modules } from '../login/index.js';
import { LogQuery } from './interfaces/log-query.class.js';
import { LoggerDaoService } from './logger-dao/logger-dao.service.js';

@Controller('logging')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Modules('admin')
export class LoggingController {
  constructor(private logDao: LoggerDaoService) { }

  @Get('dates-groups')
  async getDatesGroups(@Query() query: LogQuery) {
    return this.logDao.datesGroup(query.toFilter());
  }

  @Get()
  async getEntries(@Query() query: LogQuery) {
    return this.logDao.readAll(query.toFilter());
  }
}
