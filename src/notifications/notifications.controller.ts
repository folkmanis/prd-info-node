import { Controller, Get, ParseArrayPipe, ParseIntPipe, Query } from '@nestjs/common';
import { InstanceId } from '../preferences/instance-id.decorator';
import { Notification, NotificationModules } from './entities';
import { NotificationsDaoService } from './notifications-dao/notifications-dao.service';

interface NotificationResponse {
  data: Notification[];
  timestamp: Date;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsDao: NotificationsDaoService) { }

  @Get()
  async getNotifications(
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
