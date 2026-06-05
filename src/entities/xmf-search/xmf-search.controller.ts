import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { Modules } from '../../login/index.js';
import { User, Usr } from '../users/index.js';
import { XmfSearchDao } from './dao/xmf-search.dao.js';
import { XmfJobsQueryDto } from './dto/xmf-jobs-filter.js';
import { ZodResponse } from 'nestjs-zod';
import { ArchiveRecordDto } from './dto/archive-record.dto.js';

@Controller('xmf-search')
@Modules('xmf-search')
export class XmfSearchController {
  constructor(private readonly xmfSearchDao: XmfSearchDao) {}

  @ZodResponse({ type: [ArchiveRecordDto] })
  @Get()
  async search(
    @Query() filter: XmfJobsQueryDto,
    @Usr('preferences') { customers }: User['preferences'],
  ) {
    return this.xmfSearchDao.findJobs(filter, customers);
  }

  @Get('count')
  @UseInterceptors(new ResponseWrapperInterceptor('count', { wrapZero: true }))
  async getCount(
    @Query() filter: XmfJobsQueryDto,
    @Usr('preferences') { customers }: User['preferences'],
  ) {
    return this.xmfSearchDao.getCount(filter, customers);
  }

  @Get('facet')
  async getFacet(
    @Query() filter: XmfJobsQueryDto,
    @Usr('preferences') { customers }: User['preferences'],
  ) {
    return this.xmfSearchDao.findFacet(filter, customers);
  }

  @Get('customers')
  async getCustomers() {
    return this.xmfSearchDao.findAllCustomers();
  }
}
