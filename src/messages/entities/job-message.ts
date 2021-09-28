import { Stats } from 'fs';
import { MessageBase } from './message-base';

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

type JobOrFtp = JobDataUpdate | JobFtpUpdate;

export class JobMessage extends MessageBase {
    readonly module = 'jobs';

    constructor(public data: JobOrFtp) {
        super();
    }
}
