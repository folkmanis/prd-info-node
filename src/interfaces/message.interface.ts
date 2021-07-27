import { ObjectId } from 'mongodb';
import { Modules } from './preferences.interface';

import { Stats } from 'fs';

export abstract class MessageBase {
    timestamp: Date;
    seenBy: string[];
    abstract readonly module: Modules;

    constructor() {
        this.timestamp = new Date;
        this.seenBy = [];
    }
}

type JobActions = 'jobUpdate' | 'ftpUpload';

interface JobDataUpdate {
    jobId: number;
    operation: 'create' | 'delete' | 'update';
}

export type FsOperations = 'add' | 'addDir' | 'change' | 'unlink' | 'ready';

interface JobFtpUpdate {
    operation: FsOperations;
    path: string[];
    stats?: Stats;
}

type JobOrFtp<T extends JobActions> = T extends 'jobUpdate' ? JobDataUpdate : JobFtpUpdate;

export class JobMessage<T extends JobActions> extends MessageBase {
    readonly module = 'jobs';

    constructor(
        public action: T,
        public data: JobOrFtp<T>,
    ) {
        super();
    }

}

export type Message<T extends JobActions> = JobMessage<T>;
