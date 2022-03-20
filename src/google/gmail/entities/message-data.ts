import { Message } from './message';
import { Type } from 'class-transformer';

export class MessageData {
  @Type(() => Message)
  data: Message;
}
