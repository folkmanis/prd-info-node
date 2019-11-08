// import mongoose, { Mongoose, Connection } from "mongoose";
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
        name: string;
        username: string;
        admin: boolean;
    }
}
