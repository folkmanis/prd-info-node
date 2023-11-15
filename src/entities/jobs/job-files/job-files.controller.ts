import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  Req,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import {
  FileElement,
  FileLocationTypes,
  FilesystemService,
  ValidPathPipe,
} from '../../../filesystem';
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
  ) {}

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
  async updateJobFolderLocation(@JobId() jobId: number): Promise<string[]> {
    const { path } = await this.jobFilesService.updateJobFolderPath(jobId);
    return path;
  }

  @Patch('copy/:src/:dst')
  @UseInterceptors(new ResponseWrapperInterceptor('copied'))
  async copyJobFilesToDropFolder(
    @Param('src', ParseIntPipe) srcType: FileLocationTypes,
    @Param('dst', ParseIntPipe) dstType: FileLocationTypes,
    @Body('source-path', ValidPathPipe) srcPath: string[],
    @Body('destination-path', ValidPathPipe) dstPath: string[],
  ): Promise<number> {
    return this.fileService.copy(srcType, dstType, srcPath, dstPath, {
      preserveTimestamps: false,
    });
  }

  @Get('read/ftp')
  async readFtpFolder(@Query('path', ValidPathPipe) path: string[]) {
    return this.fileService.readLocation(FileLocationTypes.FTP, path);
  }

  @Get('read/drop-folder')
  async readDropFolders(@Query('path', ValidPathPipe) path: string[]) {
    return this.fileService.readLocation(FileLocationTypes.DROPFOLDER, path);
  }

  @Get('read/job')
  async getJobFiles(
    @Query('path', ValidPathPipe) path: string[],
  ): Promise<FileElement[]> {
    return this.fileService.readLocation(FileLocationTypes.JOB, path);
  }

  @UseInterceptors(JobNotifyInterceptor)
  @Put(':jobId/upload')
  async uploadFile(@JobId() jobId: number, @Req() req: Request) {
    return this.jobFilesService.writeJobFiles(jobId, req);
  }
}
