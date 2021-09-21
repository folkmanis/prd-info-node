import { User } from './user.interface';

export interface Session {
    _id: string;
    expires: Date;
    session: {
        user: User;
    };
}
