import { ObjectId } from 'mongodb';
import { SystemModules } from '../../preferences';

import { Stats } from 'fs';

export abstract class MessageBase {
  abstract readonly module: SystemModules;

  timestamp: Date;
  seenBy: string[] = [];
  deletedBy: string[] = [];

  constructor() {
    this.timestamp = new Date();
  }
}

type JobActions = 'jobUpdate' | 'ftpUpload';

interface JobDataUpdate {
  jobId: number;
  operation: 'create' | 'delete' | 'update';
  action: 'jobUpdate';
}

export type FsOperations = 'add' | 'addDir' | 'change' | 'unlink' | 'ready';

interface JobFtpUpdate {
  operation: FsOperations;
  path: string[];
  stats?: Stats;
  action: 'ftpUpload';
}

type JobOrFtp<T extends JobActions> = T extends 'jobUpdate'
  ? JobDataUpdate
  : JobFtpUpdate;

export class JobMessage<T extends JobActions> extends MessageBase {
  readonly module = 'jobs';

  constructor(public data: JobOrFtp<T>) {
    super();
  }
}

export type Message<T extends JobActions> = JobMessage<T>;
