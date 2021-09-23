import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { XmfSearchService } from './xmf-search.service';
import { CreateXmfSearchDto } from './dto/create-xmf-search.dto';
import { UpdateXmfSearchDto } from './dto/update-xmf-search.dto';
import { Modules } from '../../login';
import { XmfSearchDao } from './dao/xmf-search.dao';
import { JsonParsePipe } from './json-parse.pipe';
import { ArchiveSearchQuery } from './dto/archive-search-query.dto';
import { Usr, User } from '../users';
import { PreferencesService } from '../../preferences';

@Controller('xmf-search')
@Modules('xmf-search')
export class XmfSearchController {
  constructor(
    private readonly xmfSearchDao: XmfSearchDao,
    private readonly prefService: PreferencesService,
  ) { }

  @Get()
  async search(
    @Query('query', JsonParsePipe, ValidationPipe) query: ArchiveSearchQuery,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('start', new DefaultValuePipe(0), ParseIntPipe) start: number,
    @Usr() user: User,
  ) {
    const { customers } = await this.prefService.getUserPreferences(user.username);
    return this.xmfSearchDao.findJobs(query, customers, start, limit);
  }

  @Get('customers')
  async getCustomers() {
    return this.xmfSearchDao.findAllCustomers();
  }



}
