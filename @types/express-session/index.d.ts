import { User } from '../../src/entities/users/index.js';
import { Credentials } from 'googleapis';

declare module 'express-session' {

    interface SessionData {
        user: User;
        lastSeen: {
            ip: string,
            date: Date,
        };
        redirectPath?: string;
        tokens?: Credentials;
    }

}

