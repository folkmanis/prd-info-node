import { Controller, Get, Query, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { QueryStartLimitPipe, StartAndLimit } from '../../lib/query-start-limit.pipe';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { Modules } from '../../login';
import { XmfSearchDao } from './dao/xmf-search.dao';
import { XmfJobsFilter } from './dto/xmf-jobs-filter';
import { QueryFilter } from './query-filter.decorator';

@Controller('xmf-search')
@Modules('xmf-search')
@UsePipes(ValidationPipe)
export class XmfSearchController {

  constructor(
    private readonly xmfSearchDao: XmfSearchDao,
  ) { }

  @Get()
  async search(
    @Query(QueryStartLimitPipe) { limit, start }: StartAndLimit,
    @QueryFilter() query: XmfJobsFilter,
  ) {
    return this.xmfSearchDao.findJobs(query, start, limit);
  }

  @Get('count')
  @UseInterceptors(new ResponseWrapperInterceptor('count'))
  async getCount(
    @QueryFilter() query: XmfJobsFilter,
  ) {
    return this.xmfSearchDao.getCount(query);
  }

  @Get('facet')
  async getFacet(
    @QueryFilter() query: XmfJobsFilter,
  ) {
    return this.xmfSearchDao.findFacet(query);
  }

  @Get('customers')
  async getCustomers() {
    return this.xmfSearchDao.findAllCustomers();
  }


}
