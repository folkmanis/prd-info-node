import { ResponseBase } from './response-base.interface';

export interface User {
    username: string,
    name: string,
    password: string,
    admin: boolean,
    last_login: Date,
    userDisabled: boolean,
    preferences: UserPreferences,
    sessions: UserSession[];
}

export interface UserPreferences {
    customers: string[],
    modules: string[],
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