import { Logger, UseGuards, UnauthorizedException } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'ws';
import { SessionTokenService } from '../session';
import { of, fromEvent, interval } from 'rxjs';
import { delay, filter, finalize, switchMap, tap } from 'rxjs/operators';
import { NotificationModules } from '../notifications';
import { NotificationsService } from './notifications.service';
import { TokenGuard } from './token.guard';
import { NotificationsWebSocket } from './notifications-websocket.interface';
import { WsModulesGuard } from './ws-modules.guard';
import { SessionService } from '../session';

@WebSocketGateway({ path: '/data/notifications' })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly notificationService: NotificationsService,
    private readonly sessionService: SessionService,
  ) { }

  handleConnection(client: NotificationsWebSocket) {

    client.on('pong', () => client.isAlive = true);

    client.pingSubscription = interval(5 * 1000).pipe(
      tap(() => {
        if (!client.isAlive || !client.authorized) {
          throw new UnauthorizedException('Connection lost');
        }
      }),
      switchMap(() => this.sessionService.validateSession(client.authorized!.sessionId)),
      tap(isSession => {
        if (!isSession) {
          throw new UnauthorizedException('Session ended');
        }
      })
    )
      .subscribe({
        next: () => {
          client.isAlive = false;
          client.ping();
        },
        error: err => {
          client.terminate();
          this.logger.error(err);
        }
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
    this.logger.log(`Client ${client.authorized?.userId} subscribed to ${module}`);

    return {
      data: {
        subs: [...client.modules.values()]
      }
    };
  }

  @UseGuards(TokenGuard)
  @SubscribeMessage('unsubs')
  hendleUnsubscribe(
    @MessageBody('module') module: NotificationModules, // require
    @ConnectedSocket() client: NotificationsWebSocket,
  ) {

    client.modules.delete(module);

    this.resubscribeModules(client);

    this.logger.log(`Client ${client.authorized?.userId} unsubscribed from ${module}`);

    return {
      data: {
        subs: [...client.modules.values()]
      }
    };
  }

  private resubscribeModules(client: NotificationsWebSocket) {
    client.modSubscription?.unsubscribe();
    if (client.modules.size > 0) {
      client.modSubscription = this.notificationService.subscribeTo(
        [...client.modules.values()],
        client.authorized?.inst!,
      )
        .subscribe(notif => client.send(JSON.stringify(notif))); // 
    }
  }


}
