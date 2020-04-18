declare namespace Express {
    export interface Request {
        session?: Session;
        userPreferences?: {
            customers: string[],
            modules: string[],
        };
        log: {
            debug: (message: string, metadata?: any) => void,
            info: (message: string, metadata?: any) => void,
            error: (message: string, metadata?: any) => void,
        };
        systemPreferences?: Map<string, { [key: string]: any; }>;
    }
    export interface Response {
        result: { [key: string]: any; };
    }
    export interface Session {
        user: User;
    }
    export interface User {
        name: string;
        username: string;
        admin: boolean;
        preferences: {
            customers: string[],
            modules: string[],
        };
    }
}
