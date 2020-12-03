import { ResponseBase } from './response-base.interface';

export interface User {
    username: string,
    name: string,
    password: string,
    admin: boolean,
    last_login: Date,
    userDisabled: boolean,
    preferences: UserPreferences,
}

export interface UserPreferences {
    customers: string[],
    modules: string[],
}

export interface UsersResponse extends ResponseBase<User> {
}