import { ObjectId } from 'mongodb';
import { Modules } from './preferences.interface';

import { Response, Request } from 'express';

export abstract class MessageBase {
    timestamp: Date;
    abstract readonly module: Modules;

    constructor() {
        this.timestamp = new Date;
    }
}

export class JobMessage extends MessageBase {
    readonly module = 'jobs';

    constructor(
        public jobId: number,
        public action: 'create' | 'delete' | 'update',
    ) {
        super();
    }

}

export type Message = JobMessage;
