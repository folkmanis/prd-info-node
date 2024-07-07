import { Type } from 'class-transformer';
import { Message } from './message.js';

export class Thread {
  id: string;

  historyId: string;

  @Type(() => Message)
  messages: Message[];
}

export class ThreadData {
  @Type(() => Thread)
  data: Thread;
}
