import { User } from './user.interface';

declare module 'express-session' {
  interface SessionData {
    user: User;
    lastSeen: {
      ip: string;
      date: Date;
    };
  }
}
