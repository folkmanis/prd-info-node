import { Param, UseInterceptors, Controller, UsePipes, ValidationPipe, Get } from '@nestjs/common';
import { User } from '../../entities/users';
import { Usr } from '../../session';
import { InstanceId } from '../../preferences/instance-id.decorator';
import { Modules } from '../../login';
import { google } from 'googleapis';
import { Gmail } from './gmail.decorator';
import { gmail_v1 } from "@googleapis/gmail";
import { PluckInterceptor } from '../../lib/pluck.interceptor';

const MESSAGE_HEADERS = [
    'From', 'To', 'Subject', 'Date'
];

@Controller('google/gmail')
@Modules('jobs')
@UseInterceptors(new PluckInterceptor('data'))
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
    getMessage(
        @Gmail() gmail: gmail_v1.Gmail,
        @Param('id') id: string,
    ) {
        return gmail.users.messages.get({
            userId: 'me',
            id,
            // format: 'metadata',
            metadataHeaders: MESSAGE_HEADERS,
        });
    }

    @Get('thread/:id')
    getMessageThread(
        @Gmail() gmail: gmail_v1.Gmail,
        @Param('id') id: string
    ) {
        return gmail.users.threads.get({
            userId: 'me',
            id,
            format: 'minimal',
        });
    }


    @Get('threads')
    async getThreads(
        @Gmail() gmail: gmail_v1.Gmail
    ) {
        return gmail.users.threads.list({ maxResults: 10, userId: 'me', includeSpamTrash: false, labelIds: ['IMPORTANT'] });
    }

    @Get('labels')
    async getLabels(
        @Gmail() gmail: gmail_v1.Gmail
    ) {
        return gmail.users.labels.list({ userId: 'me' });
    }


}
