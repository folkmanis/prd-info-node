import { WebSocket } from 'ws';
import { SessionTokenEntity } from '../session/index.js';
import { Subscription } from 'rxjs';
import { NotificationModules } from './index.js';

export interface NotificationsWebSocket extends WebSocket {
  authorized?: SessionTokenEntity;
  modules: Set<NotificationModules>;
  modSubscription?: Subscription;
  pingSubscription?: Subscription;
  isAlive: boolean;
}
