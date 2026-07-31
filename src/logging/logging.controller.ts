import { Controller, Get, Query } from '@nestjs/common';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import { Modules } from '../login/index.js';
import { DatesGroupSchema } from './interfaces/dates-group.schema.js';
import { LogQueryDto } from './interfaces/log-query.schema.js';
import { LogRecordDto } from './interfaces/log-record.schema.js';
import { LoggerDaoService } from './logger-dao/logger-dao.service.js';

@Controller('logging')
@Modules('admin')
export class LoggingController {
  constructor(private logDao: LoggerDaoService) {}

  @Get('dates-groups')
  @ZodResponse({ type: [createZodDto(DatesGroupSchema)] })
  async getDatesGroups(@Query() query: LogQueryDto) {
    return this.logDao.datesGroup(query.filter);
  }

  @Get()
  @ZodResponse({ type: [LogRecordDto] })
  async getEntries(@Query() query: LogQueryDto) {
    return this.logDao.readAll(query);
  }
}
