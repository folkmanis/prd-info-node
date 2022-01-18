import { NotificationBase } from './notification-base';

export class JobsNotification extends NotificationBase<'jobs'> {
  readonly module = 'jobs';

  constructor(
    public payload: {
      jobId: number;
      operation: 'create' | 'delete' | 'update';
    },
    instanceId: string | undefined,
  ) {
    super();
    this.instanceId = instanceId;
  }
}
