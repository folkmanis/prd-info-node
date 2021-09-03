import { Modules } from '../interfaces/preferences.interface';
import { Message } from '../interfaces/message.interface';

export interface User {
    username: string,
    name: string,
    password: string,
    admin: boolean,
    last_login: Date,
    userDisabled: boolean,
    preferences: UserPreferences,
    userPreferences: ModuleUserPreferences[];
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

export interface ModuleUserPreferences {
    module: Modules;
    options?: any;
}

