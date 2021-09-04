import { Controller, Delete, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { User, Usr } from '../users';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {

    constructor(
        private messagesService: MessagesService,
    ) { }


    @Get()
    async getMessages(
        @Query('from', ParseIntPipe) fromDate: number,
        @Usr() user: User,
    ) {
        const toDate: Date = new Date();
        const modules = user.preferences.modules;

        return {
            timestamp: toDate,
            messages: await this.messagesService.getMessages(new Date(fromDate), toDate, modules, user.username),
        };
    }

    @Delete('allRead')
    async allMessagesRead(
        @Usr() user: User,
    ) {

        const modifiedCount = await this.messagesService.markAs('seenBy', user.username);

        if (modifiedCount > 0) {
            // res.notification = new SystemNotification({ operation: 'messages' });
        }
        return modifiedCount;

    }

    @Delete(':id')
    async deleteMessage(
        @Param('id') id: string,
        @Usr() user: User,
    ) {
        const filter = { _id: new ObjectId(id) };
        const deletedCount = await this.messagesService.markAs('deletedBy', user.username, filter);

        if (deletedCount > 0) {
            // res.notification = new SystemNotification({ operation: 'messages' });
        }
        return deletedCount;
    }

}
