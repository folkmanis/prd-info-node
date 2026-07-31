import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  Query,
  Res,
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
import { JobFilterDto } from './dto/job-query.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { JobId } from './job-id.decorator.js';
import { JobNotifyInterceptor } from './job-notify.interceptor.js';
import { JobsService } from './jobs.service.js';
import { JobFilesService } from './job-files/job-files.service.js';
import { JobMaterialsSummaryQuery } from './dto/job-materials-summary.query.js';
import { AllowNullResponse } from '../../lib/null-response.interceptor.js';

@Controller('jobs')
@Modules('jobs')
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateOne(@JobId() jobId: number, @Body() jobUpdate: UpdateJobDto) {
    return this.jobsDao.updateJob({ ...jobUpdate, jobId });
  }

  @Patch('')
  @UseInterceptors(new ResponseWrapperInterceptor('count', { wrapZero: true }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMany(@Body() jobsUpdate: UpdateJobDto[]) {
    return this.jobsDao.updateJobs(jobsUpdate);
  }

  @Put('')
  @UseInterceptors(TouchProductInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async insertOne(@Body() job: CreateJobDto) {
    const document = {
      ...job,
      _id: new ObjectId(),
      jobId: await this.jobsService.nexJobId(),
    };
    return this.jobsDao.insertOne(document);
  }

  @Get('materials-summary')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMaterialsSummary(@Query() query: JobMaterialsSummaryQuery) {
    return this.jobsService.getMaterialsTotals(query);
  }

  @Get('jobs-without-invoices-totals')
  async getInvoicesTotals() {
    return this.jobsInvoicesDao.jobsWithoutInvoiceTotals();
  }

  @Get('count')
  @UseInterceptors(new ResponseWrapperInterceptor('count', { wrapZero: true }))
  async getJobsCount(@Query() query: JobFilterDto) {
    return this.jobsService.getCount(query);
  }

  @Get('report')
  @AllowNullResponse()
  async jobProductsReport(@Query() query: JobFilterDto, @Res() res: Response) {
    const pdf = await this.jobsService.getJobsReport(query);
    const stream = await pdf.getStream();
    res.contentType('application/pdf');
    stream.pipe(res);
    stream.end();
  }

  @Get(':jobId')
  async getJob(@JobId() jobId: number) {
    return this.jobsService.getOne(jobId);
  }

  @Get('')
  async getJobs(@Query() query: JobFilterDto) {
    return this.jobsService.getAll(query);
  }
}
