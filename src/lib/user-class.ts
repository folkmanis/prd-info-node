export interface User {
    username: string,
    name: string,
    password: string,
    admin: boolean,
    last_login: Date,
    preferences: UserPreferences,
}

export interface UserPreferences {
    customers: string[],
}