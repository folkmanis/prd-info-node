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
} from '@nestjs/common';
import { User } from '../../entities/users';
import { FilesystemService } from '../../filesystem';
import { PlainToClassInterceptor } from '../../lib/plain-to-class.interceptor';
import { PluckInterceptor } from '../../lib/pluck.interceptor';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { Modules } from '../../login';
import { Usr } from '../../session';
import { AttachmentSaveDto, ThreadQuery, ThreadsQuery } from './dto';
import { MessageData } from './entities';
import { ThreadData } from './entities/thread';
import { Gmail } from './gmail.decorator';
import { GoogleClientGuard } from '../oauth2/google-client.guard';
import { GmailGuard } from './gmail.guard';


const MESSAGE_HEADERS = ['From', 'To', 'Subject', 'Date'];

@Controller('google/gmail')
@Modules('jobs')
@UseGuards(GoogleClientGuard, GmailGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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
    await this.fileSystem.writeBuffer(buff, [
      user.username,
      body.attachment.filename,
    ]);

    return [body.attachment.filename];
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
    ClassSerializerInterceptor,
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
