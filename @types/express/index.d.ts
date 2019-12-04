declare namespace Express {

    export interface Request {
        sqlConnection: any;
        session?: Session;
        userPreferences?: any;
    }
    export interface Response {
        result: { [key: string]: any };
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
