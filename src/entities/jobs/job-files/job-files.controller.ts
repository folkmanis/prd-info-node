import {
    Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Put, Query, Req, UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { Request } from 'express';
import { FilesystemService } from '../../../filesystem';
import { ResponseWrapperInterceptor } from '../../../lib/response-wrapper.interceptor';
import { Modules } from '../../../login';
import { User, Usr } from '../../../session';
import { FtpFileCopyDto, UserFileMoveDto } from '../dto/file-move.dto';
import { JobId } from '../job-id.decorator';
import { JobNotifyInterceptor } from '../job-notify.interceptor';
import { JobsService } from '../jobs.service';


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

    @Get('read/ftp')
    async readFtpFolder(
        @Query('folder') folder: string,
    ) {
        const path = folder ? [folder] : [];
        return this.fileService.readFtpDir(path);
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
