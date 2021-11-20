import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { User } from '../entities/users';
import { ObjectIdPipe } from '../lib/object-id.pipe';
import { NotificationsService, SystemNotification, Systemoperations } from '../notifications';
import { InstanceId } from '../preferences/instance-id.decorator';
import { Usr } from '../session';
import { MessagesService } from './messages.service';

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
  async allMessagesRead(
    @Usr() user: User,
    @InstanceId() instanceId: string,
  ) {
    const modifiedCount = await this.messagesService.markAs(
      'seenBy',
      user.username,
    );

    if (modifiedCount > 0) {
      const n = new SystemNotification({ operation: Systemoperations.MESSAGE_ALL_READ });
      n.instanceId = instanceId;
      this.notificationsService.notify(n);
    }
    return modifiedCount;
  }

  @Delete(':id')
  async deleteMessage(
    @Param('id', ObjectIdPipe) _id: ObjectId,
    @Usr() user: User,
    @InstanceId() instanceId: string,
  ) {
    const deletedCount = await this.messagesService.markAs(
      'deletedBy',
      user.username,
      { _id },
    );

    if (deletedCount > 0) {
      const n = new SystemNotification({ operation: Systemoperations.MESSAGE_DELETED });
      n.instanceId = instanceId;
      this.notificationsService.notify(n);
    }
    return deletedCount;
  }

}
