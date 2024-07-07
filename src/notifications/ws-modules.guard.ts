import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationsWebSocket } from './notifications-websocket.interface.js';

@Injectable()
export class WsModulesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { module } = context.switchToWs().getData();
    const client: NotificationsWebSocket = context.switchToWs().getClient();

    if (
      (module && client.authorized?.modules.includes(module)) ||
      module === 'system'
    ) {
      return true;
    }

    return false;
  }
}
