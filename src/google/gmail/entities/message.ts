import { Type } from 'class-transformer';
import { MessagePart } from './message-part';

export class Message {
  id: string;

  threadId: string;

  labelIds: string[];

  snippet: string;

  historyId: string;

  internalDate: string;

  @Type(() => MessagePart)
  payload: MessagePart;

  sizeEstimate: number;

  raw?: string;
}
