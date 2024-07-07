import { Message } from './message.js';
import { Type } from 'class-transformer';

export class MessageData {
  @Type(() => Message)
  data: Message;
}
