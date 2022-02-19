import { UseInterceptors, Controller, Delete, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Message } from '.';
import { User } from '../entities/users';
import { ObjectIdPipe } from '../lib/object-id.pipe';
import {
  NotificationsService,
  SystemNotification,
  Systemoperations,
} from '../notifications';
import { InstanceId } from '../preferences/instance-id.decorator';
import { Usr } from '../session';
import { MessagesService } from './messages.service';
import { ResponseWrapperInterceptor } from '../lib/response-wrapper.interceptor';

@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private notificationsService: NotificationsService,
  ) { }

  @Get()
  async getMessages(@Usr() user: User) {
    const modules = user.preferences.modules;
    return this.messagesService.getMessages(new Date(), modules, user.username);
  }

  @Patch('read/:id')
  async markOneRead(
    @Param('id', ObjectIdPipe) _id: ObjectId,
    @Usr() user: User,
    @InstanceId() instanceId: string,
  ): Promise<Message> {
    const modifiedCount = await this.messagesService.markAs(
      'seenBy',
      user.username,
      { _id },
    );

    if (modifiedCount === 0) {
      throw new NotFoundException(`Message ${_id} not updated`);
    }

    const modules = user.preferences.modules;
    const message = await this.messagesService.getOneMessage(_id, new Date(), modules, user.username);

    if (!message) {
      throw new NotFoundException(`Message ${_id} not found`);
    }

    this.notify(instanceId);

    return message;
  }

  @Patch('read')
  @UseInterceptors(new ResponseWrapperInterceptor('modifiedCount'))
  async allMessagesRead(
    @Usr() user: User,
    @InstanceId() instanceId: string
  ) {
    const modifiedCount = await this.messagesService.markAs(
      'seenBy',
      user.username,
    );

    modifiedCount > 0 && this.notify(instanceId);

    return modifiedCount;
  }

  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
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

    deletedCount > 0 && this.notify(instanceId);

    return deletedCount;
  }

  private notify(instance: string) {
    const n = new SystemNotification({
      operation: Systemoperations.MESSAGE_ALL_READ,
    });
    n.instanceId = instance;
    this.notificationsService.notify(n);

  }

}
