import { WebSocket } from 'ws';
import { SessionTokenEntity } from '../session';
import { Subscription } from 'rxjs';
import { NotificationModules } from '.';

export interface NotificationsWebSocket extends WebSocket {
  authorized?: SessionTokenEntity;
  modules: Set<NotificationModules>;
  modSubscription?: Subscription;
  pingSubscription?: Subscription;
  isAlive: boolean;
}
