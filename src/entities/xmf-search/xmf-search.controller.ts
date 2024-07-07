import {
  Controller,
  Get,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { Modules } from '../../login/index.js';
import { XmfSearchDao } from './dao/xmf-search.dao.js';
import { XmfJobsFilter } from './dto/xmf-jobs-filter.js';
import { QueryFilter } from './query-filter.decorator.js';

@Controller('xmf-search')
@Modules('xmf-search')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class XmfSearchController {
  constructor(private readonly xmfSearchDao: XmfSearchDao) { }

  @Get()
  async search(@QueryFilter() query: XmfJobsFilter) {
    return this.xmfSearchDao.findJobs(query.toFilter());
  }

  @Get('count')
  @UseInterceptors(new ResponseWrapperInterceptor('count', { wrapZero: true }))
  async getCount(@QueryFilter() query: XmfJobsFilter) {
    return this.xmfSearchDao.getCount(query.toFilter());
  }

  @Get('facet')
  async getFacet(@QueryFilter() query: XmfJobsFilter) {
    return this.xmfSearchDao.findFacet(query.toFilter());
  }

  @Get('customers')
  async getCustomers() {
    return this.xmfSearchDao.findAllCustomers();
  }
}
