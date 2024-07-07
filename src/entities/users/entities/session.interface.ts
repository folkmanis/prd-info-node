import { User } from './user.interface.js';

export interface Session {
  _id: string;
  expires: Date;
  session: {
    user: User;
  };
}
