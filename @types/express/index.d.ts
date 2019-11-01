declare namespace Express {
    export interface Request {
        sqlConnection: any;
        mongo: any;
        session?: Session;
    }
    export interface Response {
        result: { [key: string]: any };
    }
    export interface Session {
        user: User;
    }
    export interface User {
        id: number;
        name: string;
        username: string;
        admin: boolean;
    }
}
