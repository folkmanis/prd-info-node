import { Controller, UsePipes, ValidationPipe, Get } from '@nestjs/common';
import { User } from '../../entities/users';
import { Usr } from '../../session';
import { InstanceId } from '../../preferences/instance-id.decorator';
import { Modules } from '../../login';
import { GoogleAuthService } from '../google-auth.service';
import { google } from 'googleapis';
import { Gmail } from './gmail.decorator';
import { gmail_v1 } from "@googleapis/gmail";

@Controller('google/gmail')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class GmailController {

    constructor(
        private authService: GoogleAuthService,
    ) { }

    @Get('threads')
    async getMessageThreads(
        @Usr() user: User,
        @Gmail() gmail: gmail_v1.Gmail
    ) {

        // const auth = await this.authService.auth(user.eMail);

        // const gmail = google.gmail({
        //     version: 'v1',
        //     auth,
        // });

        return (await gmail.users.threads.list({ maxResults: 10, userId: 'me', includeSpamTrash: false })).data; // .data.threads;

    }



}
