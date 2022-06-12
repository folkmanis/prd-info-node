import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { FilesystemService } from '../../../filesystem';
import { ResponseWrapperInterceptor } from '../../../lib/response-wrapper.interceptor';
import { Modules } from '../../../login';
import { User, Usr } from '../../../session';
import { FtpFileCopyDto, UserFileMoveDto } from '../dto/file-move.dto';
import { JobId } from '../job-id.decorator';
import { JobNotifyInterceptor } from '../job-notify.interceptor';
import { JobFilesService } from './job-files.service';

@Controller('jobs/files')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class JobFilesController {

  constructor(
    private readonly fileService: FilesystemService,
    private readonly jobFilesService: JobFilesService,
  ) { }

  @UseInterceptors(new ResponseWrapperInterceptor('names'))
  @Put('user/upload')
  async userUpload(@Req() req: Request, @Usr() user: User) {
    return this.fileService.uploadUserFiles(user.username, req);
  }

  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  @Delete('user/:filename')
  async userFileDelete(@Usr() user: User, @Param('filename') filename: string) {
    return this.fileService.removeUserFile(user.username, filename);
  }

  @UseInterceptors(JobNotifyInterceptor)
  @Patch('move/user/:jobId')
  async moveUserFileToJob(
    @JobId() jobId: number,
    @Body() commands: UserFileMoveDto,
    @Usr() user: User,
  ) {
    return this.jobFilesService.moveUserFilesToJob(
      jobId,
      user.username,
      commands.fileNames,
    );
  }

  @UseInterceptors(JobNotifyInterceptor)
  @Patch('copy/ftp/:jobId')
  async copyFtpFilesToJob(
    @JobId() jobId: number,
    @Body() commands: FtpFileCopyDto,
  ) {
    return this.jobFilesService.copyFtpFilesToJob(jobId, commands.files);
  }

  @Patch(':jobId/update-files-location')
  @UseInterceptors(new ResponseWrapperInterceptor('path'))
  async updateJobFolderLocation(
    @JobId() jobId: number,
  ): Promise<string[]> {
    const { path } = await this.jobFilesService.updateJobFolderPath(jobId);
    return path;
  }

  @Get('read/ftp')
  async readFtpFolder(@Query('folder') folder: string) {
    const path = folder ? [folder] : [];
    return this.fileService.readFtpDir(path);
  }

  @UseInterceptors(JobNotifyInterceptor)
  @Put(':jobId/upload')
  async uploadFile(
    @JobId() jobId: number,
    @Req() req: Request
  ) {
    return this.jobFilesService.writeJobFiles(jobId, req);
  }
}
