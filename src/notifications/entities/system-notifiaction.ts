import { ObjectId } from 'mongodb';
import { NotificationBase } from './notification-base';

export enum Systemoperations {
  MESSAGE_DELETED,
  MESSAGE_ADDED,
  MESSAGE_ALL_READ,
  MESSAGES_UPDATED,
}

export class SystemNotification extends NotificationBase<'system'> {
  readonly module = 'system';

  constructor(
    public payload: {
      id?: ObjectId;
      operation: Systemoperations;
    },
  ) {
    super();
  }
}
