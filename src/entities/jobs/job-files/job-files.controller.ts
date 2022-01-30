import { Request } from 'express';
import {
    Req,
    Controller,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
    Patch,
    ParseIntPipe,
    Put,
} from '@nestjs/common';
import { Modules } from '../../../login';
import { JobNotifyInterceptor } from '../job-notify.interceptor';
import { ResponseWrapperInterceptor } from '../../../lib/response-wrapper.interceptor';
import { JobId } from '../job-id.decorator';
import { JobsService } from '../jobs.service';

@Controller('jobs/files')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseInterceptors(JobNotifyInterceptor)
export class JobFilesController {

    constructor(
        private readonly jobsService: JobsService,
    ) { }

    @Put(':jobId/upload')
    async uploadFile(@JobId(ParseIntPipe) jobId: number, @Req() req: Request) {
        const job = await this.jobsService.addFolderPathToJob(jobId);
        if (!job) {
            return undefined;
        }
        return this.jobsService.writeJobFile(job, req);
    }



}
