import { Request, Response, NextFunction, Handler } from 'express';
// import mongodb, { MongoClient } from 'mongodb';
import mongoose, { Mongoose, Connection, Schema } from "mongoose";
import { Logger } from '@overnightjs/logger';

export class MongoConnector {
    private dbname = "prd_info";
    private url = "mongodb://prdUser:9N0rqxG9KFQtosgp@192.168.8.53:27017/prd_info"; // + this.dbname;
    private auth = {
        user: "prdUser",
        password: "9N0rqxG9KFQtosgp",
    };
    readonly connection: Connection;

    constructor() {
        mongoose.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        this.connection = mongoose.connection;

        this.connection.on('error', () => console.error('mongo connection error'));
        this.connection.once('open', () => console.log('mongo connected'));
    }

    connect(): Handler {
        return (req: Request, res: Response, next: NextFunction) => {
            req.mongo = this.connection;
            next();
        }
    }
}