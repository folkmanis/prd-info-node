import { Req, Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, Query, ParseIntPipe, Put } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Modules } from '../../login';
import { Request, Response } from 'express';
import { JobsDao } from './dao/jobs-dao.service';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service';
import { KastesJobsDao } from './dao/kastes-jobs-dao';
import { JobId } from './job-id.decorator';
import { ObjectId } from 'mongodb';
import { JobQuery, JobFilter } from './dto/job-query';

@Controller('jobs')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
// Notifications interceptor
export class JobsController {

  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsDao: JobsDao,
  ) { }


  @Post(':jobId/file')
  async uploadFile(
    @JobId(ParseIntPipe) jobId: number,
    @Req() req: Request,
  ) {

    const job = await this.jobsService.addFolderPathToJob(jobId);

    return this.jobsService.writeJobFile(job, req);

  }

  @Patch('createFolder')
  async createFolder(
    @JobId(ParseIntPipe) jobId: number,
  ) {
    return this.jobsService.addFolderPathToJob(jobId);
  }

  @Patch(':jobId')
  async updateOne(
    @JobId(ParseIntPipe) jobId: number,
    @Body() jobUpdate: UpdateJobDto,
  ) {
    return this.jobsDao.updateJob({ ...jobUpdate, jobId });

    // this.productsDao.touchProduct(
  }

  @Post('')
  async updateMany(
    @Body() jobsUpdate: UpdateJobDto[]
  ) {

    return this.jobsDao.updateJobs(jobsUpdate);

  }

  @Put('')
  async InsertOne(
    @Body() job: CreateJobDto
  ) {

    return this.jobsDao.insertOne({
      ...job,
      _id: new ObjectId(),
      jobId: await this.jobsService.nexJobId(),
    });

    // this.productsDao.touchProduct(

  }

  @Get('jobs-without-invoices-totals')
  async getInvoicesTotals() {
    // res.json(await this.jobsDao.jobsWithoutInvoiceTotals());
  }

  @Get(':jobId')
  async getJob(
    @JobId(ParseIntPipe) jobId: number,
  ) {
    return this.jobsDao.getOne(jobId);
  }

  @Get('')
  async getJobs(
    @Query() query: JobQuery
  ) {
    return this.jobsDao.getAll(query);
  }

}

