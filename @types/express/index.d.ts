declare namespace Express {

    export interface Request {
        sqlConnection: any;
        session?: Session;
        userPreferences?: any;
        log: {
            debug: (message: string, metadata?: any) => void,
            info: (message: string, metadata?: any) => void,
            error: (message: string, metadata?: any) => void,
        };
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
    }
}
