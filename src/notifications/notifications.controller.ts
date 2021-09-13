import {
  Controller,
  Get,
  ParseIntPipe,
  ParseArrayPipe,
  Param,
  Query,
} from '@nestjs/common';
import { NotificationsDaoService } from './notifications-dao/notifications-dao.service';
import { NotificationModules, Notification } from './notification';
import { InstanceId } from '../preferences/instance-id.decorator';

interface NotificationResponse {
  data: Notification[];
  timestamp: Date;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsDao: NotificationsDaoService) { }

  @Get()
  async getMessages(
    @Query('from', ParseIntPipe) fromDate: number,
    @Query('modules', ParseArrayPipe) modules: NotificationModules[],
    @InstanceId() instanceId: string,
  ): Promise<NotificationResponse> {
    const toDate = new Date();
    const data = await this.notificationsDao.getAll(
      new Date(fromDate),
      toDate,
      modules,
      instanceId,
    );
    return {
      data,
      timestamp: toDate,
    };
  }
}
