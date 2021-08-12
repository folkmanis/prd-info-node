import { ObjectId } from 'mongodb';
import { Modules } from './preferences.interface';

export abstract class NotificationBase<T extends Modules = any> {

    abstract readonly module: T;
    abstract payload: any;

    timestamp: Date;
    instanceId: string | undefined;

    constructor() {
        this.timestamp = new Date();
    }

}

export class JobsNotification extends NotificationBase<'jobs'> {

    readonly module = 'jobs';

    constructor(
        public payload: {
            jobId: number,
            operation: 'create' | 'delete' | 'update',
        }

    ) {
        super();
    }

}

export class SystemNotification extends NotificationBase<'system'> {
    readonly module = 'system';

    constructor(
        public payload: {
            operation: 'messages' | 'ftpWatcher';
            id?: ObjectId;
        }
    ) {
        super();
    }
}
