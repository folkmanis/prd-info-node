import { Controller, Get, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Modules } from '../../login';
import { JobQuery } from '../jobs/dto/job-query';
import { Job, KastesJob } from '../jobs/entities/job.entity';
import { JobsService } from '../jobs/jobs.service';

@Controller('kastes/jobs')
@Modules('kastes')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class KastesJobsController {

    constructor(
        private readonly jobsService: JobsService,
    ) { }

    @Get()
    async getKastesJobs(
        @Query() query: JobQuery,
    ): Promise<KastesJob[]> {
        query.category = 'perforated paper';
        return this.jobsService.getAll(query.toFilter(), !!query.unwindProducts) as Promise<KastesJob[]>;
    }

    @Get(':jobId')
    async getKastesJob(
        @Param('jobId', ParseIntPipe) jobId: number,
    ): Promise<KastesJob | undefined> {
        const job = await this.jobsService.getOne(jobId);
        if (isKastesJob(job)) {
            return job;
        }
    }

}

function isKastesJob(job: Job | null): job is KastesJob {
    return job?.production?.category === 'perforated paper';
}
