import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { StartLimit } from '../../lib/start-limit-filter/start-limit-filter.class.js';
import { Modules } from '../../login/index.js';
import { XmfUploadProgressDao } from './dao/xmf-upload-progress.dao.js';
import { XmfParserService } from './parser/xmf-parser-service.js';
import { UploadMessageInterceptor } from './upload-message.interceptor.js';

@Controller('xmf-upload')
@Modules('xmf-upload')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class XmfUploadController {
  constructor(
    private readonly xmfParser: XmfParserService,
    private readonly uploadProgressDao: XmfUploadProgressDao,
  ) { }

  @Post()
  @UseInterceptors(UploadMessageInterceptor)
  async fileUpload(@Req() req: Request) {
    return this.xmfParser.parseRequest(req);
  }

  @Get()
  async findAll(@Query() query: StartLimit) {
    return this.uploadProgressDao.findAll(query);
  }
}
