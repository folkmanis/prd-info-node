import { Body, Controller, Get, ParseIntPipe, Patch, Put, Query, Req, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { Modules } from '../../login';
import { TouchProductInterceptor } from '../products/touch-product.interceptor';
import { JobsDao } from './dao/jobs-dao.service';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobQuery } from './dto/job-query';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobId } from './job-id.decorator';
import { JobNotifyInterceptor } from './job-notify.interceptor';
import { JobsService } from './jobs.service';

@Controller('jobs')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseInterceptors(JobNotifyInterceptor)
export class JobsController {

  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsDao: JobsDao,
    private readonly jobsInvoicesDao: JobsInvoicesDao,
  ) { }


  @Put(':jobId/file')
  async uploadFile(
    @JobId(ParseIntPipe) jobId: number,
    @Req() req: Request,
  ) {

    const job = await this.jobsService.addFolderPathToJob(jobId);
    if (!job) {
      return undefined;
    }
    return this.jobsService.writeJobFile(job, req);

  }

  @Patch(':jobId/createFolder')
  async createFolder(
    @JobId(ParseIntPipe) jobId: number,
  ) {
    return this.jobsService.addFolderPathToJob(jobId);
  }

  @Patch(':jobId')
  @UseInterceptors(TouchProductInterceptor)
  async updateOne(
    @JobId(ParseIntPipe) jobId: number,
    @Body() jobUpdate: UpdateJobDto,
  ) {
    return this.jobsDao.updateJob({ ...jobUpdate, jobId });
  }

  @Patch('')
  async updateMany(
    @Body() jobsUpdate: UpdateJobDto[]
  ) {
    return this.jobsDao.updateJobs(jobsUpdate);
  }

  @Put('')
  @UseInterceptors(TouchProductInterceptor)
  async insertOne(
    @Body() job: CreateJobDto
  ) {
    const document = {
      ...job,
      _id: new ObjectId(),
      jobId: await this.jobsService.nexJobId(),
    };
    return this.jobsDao.insertOne(document);
  }

  @Get('jobs-without-invoices-totals')
  async getInvoicesTotals() {
    return this.jobsInvoicesDao.jobsWithoutInvoiceTotals();
  }

  @Get('count')
  @UseInterceptors(new ResponseWrapperInterceptor('count'))
  async getJobsCount(
    @Query() query: JobQuery
  ) {
    return this.jobsDao.getCount(query.toFilter());
  }

  @Get(':jobId')
  async getJob(
    @JobId(ParseIntPipe) jobId: number,
  ) {
    return this.jobsService.getOne(jobId);
  }

  @Get('')
  async getJobs(
    @Query() query: JobQuery
  ) {
    return this.jobsService.getAll(query.toFilter(), !!query.unwindProducts);
  }

}

