import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { User } from '../entities/users/index.js';
import { ObjectIdPipe } from '../lib/object-id.pipe.js';
import { ResponseWrapperInterceptor } from '../lib/response-wrapper.interceptor.js';
import { Usr } from '../session/index.js';
import { MessageNotifyInterceptor } from './message-notify.interceptor.js';
import { MessagesService } from './messages.service.js';

@Controller('messages')
@UseInterceptors(MessageNotifyInterceptor)
export class MessagesController {
  constructor(private messagesService: MessagesService) { }

  @Get()
  async getMessages(@Usr() user: User) {
    const modules = user.preferences.modules;
    return this.messagesService.getMessages(new Date(), modules, user.username);
  }

  @Patch('read/:id')
  async markOneRead(
    @Param('id', ObjectIdPipe) _id: ObjectId,
    @Usr() user: User,
  ) {
    const modifiedCount = await this.messagesService.markAs(
      'seenBy',
      user.username,
      { _id },
    );

    if (modifiedCount === 0) {
      throw new NotFoundException(`Message ${_id} not updated`);
    }

    const modules = user.preferences.modules;
    return this.messagesService.getOneMessage(
      _id,
      new Date(),
      modules,
      user.username,
    );
  }

  @Patch('read')
  @UseInterceptors(new ResponseWrapperInterceptor('modifiedCount'))
  async allMessagesRead(@Usr() user: User) {
    return this.messagesService.markAs('seenBy', user.username);
  }

  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteMessage(
    @Param('id', ObjectIdPipe) _id: ObjectId,
    @Usr() user: User,
  ) {
    return this.messagesService.markAs('deletedBy', user.username, { _id });
  }
}
