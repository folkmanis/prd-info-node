import { Stats } from 'fs';
import { MessageBase } from './message-base';

export type FsOperations = 'add' | 'addDir' | 'change' | 'unlink' | 'ready';

interface JobFtpUpdate {
    operation: FsOperations;
    path: string[];
    stats?: Stats;
    action: 'ftpUpload';
}

export class JobMessage extends MessageBase {
    readonly module = 'jobs';

    constructor(public data: JobFtpUpdate) {
        super();
    }
}
