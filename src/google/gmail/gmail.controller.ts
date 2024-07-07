import { gmail_v1 } from 'googleapis';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseFilters,
  Patch,
} from '@nestjs/common';
import { User } from '../../entities/users/index.js';
import { FilesystemService } from '../../filesystem/index.js';
import { PlainToClassInterceptor } from '../../lib/plain-to-class.interceptor.js';
import { PluckInterceptor } from '../../lib/pluck.interceptor.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { Modules } from '../../login/index.js';
import { Usr } from '../../session/index.js';
import {
  AttachmentSaveDto,
  ThreadQuery,
  ThreadsQuery,
  MessageModifyDto,
} from './dto/index.js';
import { MessageData } from './entities/index.js';
import { ThreadData } from './entities/thread.js';
import { Gmail } from './gmail.decorator.js';
import { GoogleClientGuard } from '../oauth2/google-client.guard.js';
import { GmailGuard } from './gmail.guard.js';
import { InvalidGrantFilter } from '../invalid-grant.filter.js';

const MESSAGE_HEADERS = ['From', 'To', 'Subject', 'Date'];

@Controller('google/gmail')
@Modules('jobs')
@UseGuards(GoogleClientGuard, GmailGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseFilters(InvalidGrantFilter)
export class GmailController {
  constructor(private readonly fileSystem: FilesystemService) { }

  @Put('message/attachment')
  @UseInterceptors(new ResponseWrapperInterceptor('names'))
  async getAttachment(
    @Gmail() gmail: gmail_v1.Gmail,
    @Body() body: AttachmentSaveDto,
    @Usr() user: User,
  ) {
    const { data } = await gmail.users.messages.attachments.get({
      userId: 'me',
      id: body.attachment.attachmentId,
      messageId: body.messageId,
    });

    if (!data.data) {
      throw new NotFoundException(body, 'Attachment not found');
    }
    const buff = Buffer.from(data.data, 'base64url');
    await this.fileSystem.writeBufferToUser(
      buff,
      user.username,
      body.attachment.filename,
    );

    return [body.attachment.filename];
  }

  @Patch('message/:id')
  @UseInterceptors(
    new PluckInterceptor('data'),
    ClassSerializerInterceptor,
    new PlainToClassInterceptor(MessageData),
  )
  modifyMessage(
    @Gmail() gmail: gmail_v1.Gmail,
    @Param('id') id: string,
    @Body() changes: MessageModifyDto,
  ) {
    return gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: changes,
    });
  }

  @Get('message/:id')
  @UseInterceptors(
    new PluckInterceptor('data'),
    ClassSerializerInterceptor,
    new PlainToClassInterceptor(MessageData),
  )
  async getMessage(@Gmail() gmail: gmail_v1.Gmail, @Param('id') id: string) {
    return gmail.users.messages.get({
      userId: 'me',
      id,
      metadataHeaders: MESSAGE_HEADERS,
    });
  }

  @Get('thread/:id')
  @UseInterceptors(
    new PluckInterceptor('data'),
    // ClassSerializerInterceptor,
    new PlainToClassInterceptor(ThreadData),
  )
  getMessageThread(
    @Gmail() gmail: gmail_v1.Gmail,
    @Param('id') id: string,
    @Query() query: ThreadQuery,
  ) {
    return gmail.users.threads.get({
      userId: 'me',
      id,
      ...query,
    });
  }

  @Get('threads')
  @UseInterceptors(new PluckInterceptor('data'))
  async getThreads(
    @Gmail() gmail: gmail_v1.Gmail,
    @Query() query: ThreadsQuery,
  ) {
    return gmail.users.threads.list({
      userId: 'me',
      ...query,
    });
  }

  @Get('labels')
  @UseInterceptors(new PluckInterceptor('data'))
  async getLabels(@Gmail() gmail: gmail_v1.Gmail) {
    return gmail.users.labels.list({ userId: 'me' });
  }

  @Get('label/:id')
  @UseInterceptors(new PluckInterceptor('data'))
  async getLabel(@Gmail() gmail: gmail_v1.Gmail, @Param('id') id: string) {
    return gmail.users.labels.get({ userId: 'me', id });
  }
}
