import { Param, UseInterceptors, Controller, UsePipes, ValidationPipe, Get, ClassSerializerInterceptor, Query, ParseIntPipe, ParseArrayPipe, DefaultValuePipe } from '@nestjs/common';
import { User } from '../../entities/users';
import { Usr } from '../../session';
import { InstanceId } from '../../preferences/instance-id.decorator';
import { Modules } from '../../login';
import { google } from 'googleapis';
import { Gmail } from './gmail.decorator';
import { gmail_v1 } from "@googleapis/gmail";
import { PluckInterceptor } from '../../lib/pluck.interceptor';
import { Message, MessageData } from './entities';
import { PlainToClassInterceptor } from '../../lib/plain-to-class.interceptor';
import { plainToClass } from 'class-transformer';
import { ThreadData } from './entities/thread';
import { ThreadsQuery, ThreadQuery } from './dto';

const MESSAGE_HEADERS = [
    'From', 'To', 'Subject', 'Date'
];

@Controller('google/gmail')
@Modules('jobs')
@UseInterceptors(new PluckInterceptor('data'), ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class GmailController {

    constructor(
    ) { }

    @Get('message/:messageId/attachment/:id')
    getAttachment(
        @Gmail() gmail: gmail_v1.Gmail,
        @Param('messageId') messageId: string,
        @Param('id') id: string,
    ) {
        return gmail.users.messages.attachments.get({
            userId: 'me',
            id,
            messageId,
        });
    }

    @Get('message/:id')
    @UseInterceptors(new PlainToClassInterceptor(MessageData))
    async getMessage(
        @Gmail() gmail: gmail_v1.Gmail,
        @Param('id') id: string,
    ) {


        return gmail.users.messages.get({
            userId: 'me',
            id,
            metadataHeaders: MESSAGE_HEADERS,
        });
    }

    @Get('thread/:id')
    @UseInterceptors(new PlainToClassInterceptor(ThreadData))
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
    async getThreads(
        @Gmail() gmail: gmail_v1.Gmail,
        @Query() query: ThreadsQuery,
    ) {
        console.log(query);
        return gmail.users.threads.list({
            userId: 'me',
            ...query,
        });
    }

    @Get('labels')
    async getLabels(
        @Gmail() gmail: gmail_v1.Gmail
    ) {
        return gmail.users.labels.list({ userId: 'me' });
    }


}
