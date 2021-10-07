import { NotificationModules } from './notification-modules';

export abstract class NotificationBase<T extends NotificationModules> {
    abstract readonly module: T;
    abstract payload: any;

    timestamp: Date;
    instanceId: string | undefined;

    constructor() {
        this.timestamp = new Date();
    }
}
