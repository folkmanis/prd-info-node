import { ParseIntPipe, Controller, UseInterceptors, Get, Post, Body, Patch, Param, Delete, ParseBoolPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { VeikalsCreateDto } from './dto/veikals-create.dto';
import { VeikalsUpdateDto } from './dto/veikals-update.dto';
import { Modules } from '../../login';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { ObjectId } from 'mongodb';
import { Kaste } from './entities/kaste.entity';
import { KastesDaoService } from './dao/kastes-dao.service';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { Veikals } from './entities/veikals';
import { VeikalsKaste } from './dto/veikals-kaste.dto';
import { JobsService } from '../jobs/jobs.service';
import { JobQuery } from '../jobs/dto/job-query';
import { Job, KastesJob } from '../jobs/entities/job.entity';

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
        return this.jobsService.getAll(query) as Promise<KastesJob[]>;
    }

    @Get(':jobId')
    async getKastesJob(
        @Param('jobId', ParseIntPipe) jobId: number,
    ): Promise<KastesJob | undefined> {
        const job = await this.jobsService.getOne(jobId);
        console.log(job);
        if (isKastesJob(job)) {
            return job;
        }
    }

}

function isKastesJob(job: Job | null): job is KastesJob {
    return job?.production?.category === 'perforated paper';
}
