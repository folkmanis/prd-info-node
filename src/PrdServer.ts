import * as bodyParser from 'body-parser';
import * as controllers from './controllers';
import { Server } from '@overnightjs/core';

import { MongoClient } from 'mongodb';
import PrdSession from './lib/session-handler';
import Logger from './lib/logger';
import UsersDAO from './dao/usersDAO';
import XmfSearchDAO from './dao/xmf-searchDAO';

export class PrdServer extends Server {

    private readonly SERVER_STARTED = 'Server started on port: ';

    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    async connectDB(uri: string | undefined): Promise<MongoClient> {
        if (!uri) {
            console.error('Mongo environment not defined');
            return process.exit(1);
        }
        return MongoClient.connect(uri,
            {
                poolSize: 50,
                authSource: "admin",
                useUnifiedTopology: true,
                useNewUrlParser: true,
                connectTimeoutMS: 5000,
                wtimeout: 2500,
            },
        ).catch(err => {
            console.error(err.stack);
            return process.exit(1);
        }).then(async client => {
            if (!client) {
                console.error("No connection to mongod");
                return process.exit(1);
            }
            Logger.initLogger(client);
            Logger.debug('Mongo connected');
            this.app.use(Logger.handler);
            UsersDAO.injectDB(client);
            XmfSearchDAO.injectDB(client);
            this.app.use(PrdSession.injectDB(client));
            return client;
        });
    }

    setupControllers(): void {
        const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                const controller = (controllers as any)[name];
                ctlrInstances.push(new controller());
            }
        }
        super.addControllers(ctlrInstances);
    }

    start(port: number): void {
        this.app.get('*', (req, res) => {
            res.send(this.SERVER_STARTED + port);
        });
        this.app.listen(port, () => {
            console.log(this.SERVER_STARTED + port);
        });
    }
}
