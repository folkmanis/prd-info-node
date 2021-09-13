import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { User, Usr } from '../entities/users';
import { MessagesService } from './messages.service';
import { NotificationsService, SystemNotification } from '../notifications';
import { ObjectIdPipe } from '../lib/object-id.pipe';

@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private notificationsService: NotificationsService,
  ) { }

  @Get()
  async getMessages(
    @Usr() user: User,
  ) {
    const toDate: Date = new Date();
    const modules = user.preferences.modules;

    return this.messagesService.getMessages(
      toDate,
      modules,
      user.username,
    );
  }

  @Delete('allRead')
  async allMessagesRead(@Usr() user: User) {
    const modifiedCount = await this.messagesService.markAs(
      'seenBy',
      user.username,
    );

    if (modifiedCount > 0) {
      this.notificationsService.notify(
        new SystemNotification({ operation: 'messages' }),
      );
    }
    return modifiedCount;
  }

  @Delete(':id')
  async deleteMessage(
    @Param('id', ObjectIdPipe) _id: ObjectId,
    @Usr() user: User
  ) {
    const deletedCount = await this.messagesService.markAs(
      'deletedBy',
      user.username,
      { _id },
    );

    if (deletedCount > 0) {
      this.notificationsService.notify(
        new SystemNotification({ operation: 'messages' }),
      );
    }
    return deletedCount;
  }

}
