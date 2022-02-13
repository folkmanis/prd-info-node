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
    Body,
    Delete,
    Param
} from '@nestjs/common';
import { Modules } from '../../../login';
import { JobNotifyInterceptor } from '../job-notify.interceptor';
import { ResponseWrapperInterceptor } from '../../../lib/response-wrapper.interceptor';
import { JobId } from '../job-id.decorator';
import { JobsService } from '../jobs.service';
import { FilesystemService } from '../../../filesystem';
import { Usr, User } from '../../../session';
import { UserFileMoveDto, FtpFileCopyDto } from '../dto/file-move.dto';

@Controller('jobs/files')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class JobFilesController {

    constructor(
        private readonly jobsService: JobsService,
        private readonly fileService: FilesystemService,
    ) { }

    @UseInterceptors(new ResponseWrapperInterceptor('names'))
    @Put('user/upload')
    async userUpload(
        @Req() req: Request,
        @Usr() user: User,
    ) {
        const path = [user.username];
        return this.fileService.uploadUserFiles(path, req);
    }

    @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
    @Delete('user/:filename')
    async userFileDelete(
        @Usr() user: User,
        @Param('filename') filename: string,
    ) {
        const path = [user.username];
        return this.fileService.removeUserFile(path, filename);
    }

    @UseInterceptors(JobNotifyInterceptor)
    @Patch('move/user/:jobId')
    async moveUserFileToJob(
        @JobId(ParseIntPipe) jobId: number,
        @Body() commands: UserFileMoveDto,
        @Usr() user: User,
    ) {
        return this.jobsService.moveFilesToJob(jobId, [user.username], commands.fileNames);
    }

    @UseInterceptors(JobNotifyInterceptor)
    @Patch('copy/ftp/:jobId')
    async copyFtpFilesToJob(
        @JobId(ParseIntPipe) jobId: number,
        @Body() commands: FtpFileCopyDto,
    ) {
        return this.jobsService.copyFilesToJob(jobId, commands.files);
    }

    @UseInterceptors(JobNotifyInterceptor)
    @Put(':jobId/upload')
    async uploadFile(
        @JobId(ParseIntPipe) jobId: number,
        @Req() req: Request
    ) {
        return this.jobsService.writeJobFile(jobId, req);
    }



}
