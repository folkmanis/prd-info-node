import { Request, Response, NextFunction, Handler } from 'express';
import mongodb, { MongoClient } from 'mongodb';
import { Logger } from '@overnightjs/logger';

export class MongoConnector {
    private dbname = "prd_info";
    private url = "mongodb://prdUser:9N0rqxG9KFQtosgp@192.168.8.53:27017/prd_info"; // + this.dbname;
    private auth = {
        user: "prdUser",
        password: "9N0rqxG9KFQtosgp",
    };
    client: MongoClient;

    constructor() {
        this.client = new MongoClient(
            this.url,
            {
                // auth: this.auth,
                useUnifiedTopology: true,
            },
        );
        this.clientConnect();
    }

    private async clientConnect() {
        await this.client.connect();
        console.log('mongo connected');
    }

    connect(): Handler {
        return (req: Request, res: Response, next: NextFunction) => {
            MongoClient.connect(this.url,
                {
                    auth: this.auth,
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                },
                (err, client) => {
                    if (err) { next(err); }
                    req.mongo = client;
                    console.log('mongo connected');
                    res.on('close', () => {
                        client.close()
                        console.log('mongo released');
                    });
                    next();
                }
            )
        }
    }
}