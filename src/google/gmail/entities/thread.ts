import { Type } from 'class-transformer';
import { Message } from './message';

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

