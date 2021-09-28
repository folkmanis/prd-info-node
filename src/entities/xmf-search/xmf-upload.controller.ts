import { Controller, Get, Headers, Logger, Post, Query, Req, UseInterceptors, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { Request } from 'express';
import { tap } from 'rxjs/operators';
import { Modules } from '../../login';
import { Usr } from '../../session';
import { UploadProgressService } from './parser/upload-progress.service';
import { XmfParserService } from './parser/xmf-parser-service';
import { UploadMessageInterceptor } from './upload-message.interceptor';
import { XmfUploadProgressDao } from './dao/xmf-upload-progress.dao';
import { QueryStartLimitPipe, StartAndLimit } from '../../lib/query-start-limit.pipe';


@Controller('xmf-upload')
@Modules('xmf-upload')
export class XmfUploadController {

    constructor(
        private readonly xmfParser: XmfParserService,
        private readonly uploadProgressDao: XmfUploadProgressDao,
    ) { }

    @Post()
    @UseInterceptors(UploadMessageInterceptor)
    async fileUpload(
        @Req() req: Request,
    ) {

        return this.xmfParser.parseRequest(req);

    }

    @Get()
    async findAll(
        @Query(QueryStartLimitPipe) query: StartAndLimit
    ) {
        return this.uploadProgressDao.findAll(query);
    }

}


