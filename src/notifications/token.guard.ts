import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SessionTokenService } from '../session';
import { NotificationsWebSocket } from './notifications-websocket.interface';

@Injectable()
export class TokenGuard implements CanActivate {

  constructor(
    private readonly tokenService: SessionTokenService,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const { token } = context.switchToWs().getData();
    const client: NotificationsWebSocket = context.switchToWs().getClient();

    if (!token) {
      client.terminate();
      return false;
    }

    client.authorized = this.tokenService.verify(token);

    if (!client.authorized) {
      client.terminate();
    }

    return true; // !!client.authorized;
  }
}
