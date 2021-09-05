import {
  Controller,
  Get,
  ParseIntPipe,
  ParseArrayPipe,
  Param,
  Query,
} from '@nestjs/common';
import { NotificationsDaoService } from './notifications-dao/notifications-dao.service';
import { NotificationModules } from './notification';
import { InstanceId } from '../preferences/instance-id.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsDao: NotificationsDaoService) {}

  @Get()
  async getMessages(
    @Query('from', ParseIntPipe) fromDate: number,
    @Query('modules', ParseArrayPipe) modules: NotificationModules[],
    @InstanceId() instanceId: string,
  ) {
    return this.notificationsDao.getAll(
      new Date(fromDate),
      new Date(),
      modules,
      instanceId,
    );
  }
}
