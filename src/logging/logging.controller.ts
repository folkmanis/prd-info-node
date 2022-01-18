import {
  UseInterceptors,
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseWrapperInterceptor } from '../lib/response-wrapper.interceptor';
import { Modules } from '../login';
import { LogQuery } from './interfaces/log-query.class';
import { LoggerDaoService } from './logger-dao/logger-dao.service';

@Controller('logging')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Modules('admin')
export class LoggingController {
  constructor(private logDao: LoggerDaoService) {}

  @Get('count')
  @UseInterceptors(new ResponseWrapperInterceptor('count', { wrapZero: true }))
  async getCount(@Query() query: LogQuery) {
    throw new Error('General error');

    return this.logDao.countDocuments(query.toFilter());
  }

  @Get('dates-groups')
  async getDatesGroups(@Query() query: LogQuery) {
    return this.logDao.datesGroup(query.toFilter());
  }

  @Get()
  async getEntries(@Query() query: LogQuery) {
    return this.logDao.readAll(query.toFilter());
  }
}
