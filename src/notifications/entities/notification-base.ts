export type NotificationModules = 'jobs' | 'system' | 'xmf-upload';

export abstract class NotificationBase<T extends NotificationModules = any> {
    abstract readonly module: T;
    abstract payload: any;

    timestamp: Date;
    instanceId: string | undefined;

    constructor() {
        this.timestamp = new Date();
    }
}
