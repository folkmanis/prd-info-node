import { User } from '../../src/entities/users';


declare module 'express-session' {

    interface SessionData {
        user: User;
        lastSeen: {
            ip: string,
            date: Date,
        };
    }

}

