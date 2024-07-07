import { Type } from 'class-transformer';
import { Header } from './header.js';
import { MessagePartBody } from './message-part-body.js';

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
