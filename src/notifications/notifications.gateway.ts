import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Server } from 'ws';
import { NotificationModules } from '../notifications';
import { SessionService } from '../session';
import { NotificationsWebSocket } from './notifications-websocket.interface';
import { NotificationsService } from './notifications.service';
import { TokenGuard } from './token.guard';
import { WsModulesGuard } from './ws-modules.guard';

@WebSocketGateway({ path: '/ws-notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly notificationService: NotificationsService,
    private readonly sessionService: SessionService,
  ) {}

  handleConnection(client: NotificationsWebSocket) {
    client.on('pong', () => (client.isAlive = true));

    client.pingSubscription = interval(5 * 1000)
      .pipe(
        tap(() => {
          if (!client.isAlive || !client.authorized) {
            throw new UnauthorizedException('Connection lost');
          }
        }),
        switchMap(() =>
          this.sessionService.validateSession(client.authorized!.sessionId),
        ),
        tap((isSession) => {
          if (!isSession) {
            throw new UnauthorizedException('Session ended');
          }
        }),
      )
      .subscribe({
        next: () => {
          client.isAlive = false;
          client.ping();
        },
        error: (err) => {
          client.terminate();
          this.logger.error(err);
        },
      });

    client.modules = new Set();
    client.isAlive = true;
  }

  handleDisconnect(client: NotificationsWebSocket) {
    client.modSubscription?.unsubscribe();
    client.pingSubscription?.unsubscribe();
    this.logger.log(`Client ${client.authorized?.userId} disconnected`);
  }

  // auth validator
  @UseGuards(TokenGuard, WsModulesGuard)
  @SubscribeMessage('subs')
  handleSubscription(
    @MessageBody('module') module: NotificationModules, // require
    @ConnectedSocket() client: NotificationsWebSocket,
  ) {
    client.modules.add(module);

    this.resubscribeModules(client);
    this.logger.log(
      `Client ${client.authorized?.userId} subscribed to ${module}`,
    );

    return {
      data: {
        subs: [...client.modules.values()],
      },
    };
  }

  @SubscribeMessage('unsubs')
  hendleUnsubscribe(
    @MessageBody('module') module: NotificationModules, // require
    @ConnectedSocket() client: NotificationsWebSocket,
  ) {
    client.modules.delete(module);

    this.resubscribeModules(client);

    this.logger.log(
      `Client ${client.authorized?.userId} unsubscribed from ${module}`,
    );

    return {
      data: {
        subs: [...client.modules.values()],
      },
    };
  }

  private resubscribeModules(client: NotificationsWebSocket) {
    client.modSubscription?.unsubscribe();
    if (client.modules.size > 0 && client.authorized) {
      client.modSubscription = this.notificationService
        .subscribeTo([...client.modules.values()], client.authorized.inst)
        .subscribe((notif) => client.send(JSON.stringify(notif)));
    }
  }
}
