import { ResponseBase } from './response-base.interface';
import { Message } from './message.interface';
import { Modules } from './preferences.interface';

export interface User {
    username: string,
    name: string,
    password: string,
    admin: boolean,
    last_login: Date,
    userDisabled: boolean,
    preferences: UserPreferences,
    sessions: UserSession[];
    messages: Message<any>[];
}

export interface UserPreferences {
    customers: string[],
    modules: Modules[],
}

export interface UserSession {
    _id: string;
    lastSeen: {
        date: Date;
        ip: string;
    };
}


export interface UsersResponse extends ResponseBase<User> {
}