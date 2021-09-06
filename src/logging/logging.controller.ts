import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { LogQuery } from './interfaces/log-query.class';
import { LoggerDaoService } from './logger-dao/logger-dao.service';
import { Modules } from '../login';

@Controller('logging')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Modules('admin')
export class LoggingController {

    constructor(
        private logDao: LoggerDaoService
    ) { }

    @Get('entries')
    async getEntries(
        @Query() query: LogQuery
    ) {

        return this.logDao.read(query);
    }

    @Get('dates-groups')
    async getDatesGroups(
        @Query(new ValidationPipe({ transform: true, whitelist: true })) query: LogQuery
    ) {
        return this.logDao.datesGroup(query);
    }
}
