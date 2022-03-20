import { Type } from 'class-transformer';
import { Header } from './header';
import { MessagePartBody } from './message-part-body';

export class MessagePart {
  partId: string;

  mimeType: string;

  filename?: string;

  @Type(() => Header)
  headers: Header[];

  @Type(() => MessagePartBody)
  body?: MessagePartBody;

  @Type(() => MessagePart)
  parts?: MessagePart[];
}
