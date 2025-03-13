import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { Modules } from '../../login/index.js';
import { TouchProductInterceptor } from '../products/touch-product.interceptor.js';
import { JobsDao } from './dao/jobs-dao.service.js';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { JobQuery } from './dto/job-query.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { JobId } from './job-id.decorator.js';
import { JobNotifyInterceptor } from './job-notify.interceptor.js';
import { JobsService } from './jobs.service.js';
import { JobFilesService } from './job-files/job-files.service.js';
import { JobMaterialsSummaryQuery } from './dto/job-materials-summary.query.js';

@Controller('jobs')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseInterceptors(JobNotifyInterceptor)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsDao: JobsDao,
    private readonly jobsInvoicesDao: JobsInvoicesDao,
    private readonly jobFilesService: JobFilesService,
  ) {}

  @Patch(':jobId/createFolder')
  async createFolder(@JobId() jobId: number) {
    await this.jobFilesService.addFolderPathToJob(jobId);
    return this.jobsService.getOne(jobId);
  }

  @Patch(':jobId')
  @UseInterceptors(TouchProductInterceptor)
  async updateOne(@JobId() jobId: number, @Body() jobUpdate: UpdateJobDto) {
    return this.jobsDao.updateJob({ ...jobUpdate, jobId });
  }

  @Patch('')
  @UseInterceptors(new ResponseWrapperInterceptor('count', { wrapZero: true }))
  async updateMany(@Body() jobsUpdate: UpdateJobDto[]) {
    return this.jobsDao.updateJobs(jobsUpdate);
  }

  @Put('')
  @UseInterceptors(TouchProductInterceptor)
  async insertOne(@Body() job: CreateJobDto) {
    const document = {
      ...job,
      _id: new ObjectId(),
      jobId: await this.jobsService.nexJobId(),
    };
    return this.jobsDao.insertOne(document);
  }

  @Get('materials-summary')
  async getMaterialsSummary(@Query() query: JobMaterialsSummaryQuery) {
    return this.jobsService.getMaterialsTotals(query);
  }

  @Get('jobs-without-invoices-totals')
  async getInvoicesTotals() {
    return this.jobsInvoicesDao.jobsWithoutInvoiceTotals();
  }

  @Get('count')
  @UseInterceptors(new ResponseWrapperInterceptor('count'))
  async getJobsCount(@Query() query: JobQuery) {
    return this.jobsDao.getCount(query.toFilter());
  }

  @Get(':jobId')
  async getJob(@JobId() jobId: number) {
    return this.jobsService.getOne(jobId);
  }

  @Get('')
  async getJobs(@Query() query: JobQuery) {
    return this.jobsService.getAll(query.toFilter(), !!query.unwindProducts);
  }
}
