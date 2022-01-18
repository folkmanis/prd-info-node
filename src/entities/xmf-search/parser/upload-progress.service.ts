import { Injectable, Scope } from '@nestjs/common';
import { XmfUploadProgress } from '../entities/xmf-upload-progress.entity';
import { XmfUploadProgressDao } from '../dao/xmf-upload-progress.dao';

@Injectable({ scope: Scope.REQUEST })
export class UploadProgressService {
  private _state = new XmfUploadProgress();
  private filenames: string[] = [];

  constructor(private readonly progressDao: XmfUploadProgressDao) {}

  get state(): XmfUploadProgress {
    return {
      ...this._state,
      fileName: this.filenames.join(','),
    };
  }

  set username(value: string | undefined) {
    this._state.username = value;
  }

  line = () => this._state.count.lines++;

  bytes = (val: number) => (this._state.fileSize += val);

  record = () => this._state.count.processed++;

  dbRecords = ({
    modifiedCount,
    upsertedCount,
  }: {
    modifiedCount: number;
    upsertedCount: number;
  }): XmfUploadProgress => {
    this._state.count.modified += modifiedCount;
    this._state.count.upserted += upsertedCount;
    return this.state;
  };

  file = (name: string) => this.filenames.push(name);

  finished() {
    this._state.finished = new Date();
    this.progressDao.insertOne(this.state);
  }
}
