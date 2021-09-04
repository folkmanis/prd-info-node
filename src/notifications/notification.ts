import { ObjectId } from 'mongodb';

export type NotificationModules = 'jobs' | 'system';

export type Notification = SystemNotification | JobsNotification;

export abstract class NotificationBase<T extends NotificationModules = any> {

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
