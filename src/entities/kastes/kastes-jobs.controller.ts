import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { Modules } from '../../login/index.js';
import { JobFilterDto } from '../jobs/dto/job-query.js';
import { Job, KastesJob } from '../jobs/entities/job.entity.js';
import { JobId } from '../jobs/job-id.decorator.js';
import { JobsService } from '../jobs/jobs.service.js';

@Controller('kastes/jobs')
@Modules('kastes')
export class KastesJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getKastesJobs(@Query() query: JobFilterDto): Promise<KastesJob[]> {
    query.filter.category = 'perforated paper';
    return this.jobsService.getAll(query);
  }

  @Get(':jobId')
  async getKastesJob(@JobId() jobId: number): Promise<KastesJob> {
    const job = await this.jobsService.getOne(jobId);
    assertKastesJob(job);
    return job;
  }
}

function assertKastesJob(job: Job | null): asserts job is KastesJob {
  if (job?.production?.category !== 'perforated paper') {
    throw new NotFoundException();
  }
}
