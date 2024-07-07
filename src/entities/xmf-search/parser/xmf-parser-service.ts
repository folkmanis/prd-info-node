import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { concatMap, finalize, map, tap, toArray } from 'rxjs/operators';
import { XmfSearchDao } from '../dao/xmf-search.dao.js';
import { XmfUploadProgress } from '../entities/xmf-upload-progress.entity.js';
import { rxBusboy } from './busboy-rx.js';
import { lineReader } from './line-reader.js';
import { linesToObject } from './lines-to-object.js';
import { UploadProgressService } from './upload-progress.service.js';

@Injectable()
export class XmfParserService {
  constructor(
    private readonly progress: UploadProgressService,
    private readonly xmfDao: XmfSearchDao,
  ) { }

  parseRequest(req: Request): Observable<XmfUploadProgress> {
    this.progress.username = req.session.user?.username;

    return rxBusboy(req).pipe(
      tap(({ filename }) => this.progress.file(filename)),
      concatMap(({ file }) => lineReader(file, this.progress.bytes)),
      tap(this.progress.line),
      linesToObject(),
      tap(this.progress.record),
      toArray(),
      concatMap((job) => this.xmfDao.insertManyRx(job)),
      map(this.progress.dbRecords),
      finalize(() => this.progress.finished()),
    );
  }
}
