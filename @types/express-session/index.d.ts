import { User } from '../../src/entities/users';
import { Credentials } from 'googleapis';

declare module 'express-session' {

    interface SessionData {
        user: User;
        lastSeen: {
            ip: string,
            date: Date,
        };
        redirectPath?: string;
    }

}

