import * as bodyParser from 'body-parser';
import * as dao from './dao';
import * as controllers from './controllers';
import { Server } from '@overnightjs/core';

import { MongoClient } from 'mongodb';
import PrdSession from './lib/session-handler';
import Logger, { Console, MongoLog } from './lib/logger';

export class PrdServer extends Server {

    private readonly SERVER_STARTED = 'Server started';

    constructor() {
        super(true);
        Logger.addTransport(new Console());  // Pievieno konsoles izvadi Logger objektam
        this.app.use(Logger.handler); // Logger funkcijas būs pieejamas kā req.log
        this.app.use(bodyParser.json({limit: process.env.BODY_SIZE_LIMIT}));
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    async connectDB(uri: string | undefined): Promise<MongoClient> {
        if (!uri) {
            Logger.error('Mongo environment not defined');  // Inicializācijas laikā lieto statisko objektu
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
            Logger.error('Error connecting to mongodb', err.stack);
            return process.exit(1);
        }).then(async client => {
            if (!client) {
                Logger.error("No connection to mongod");
                return process.exit(1);
            }
            Logger.addTransport(new MongoLog(client)); // Loggerim pievieno arī mongo izvadi
            Logger.debug('Mongo connected');
            this.setupDAO(client); // All DAO initialisation
            this.app.use(PrdSession.injectDB(client)); // Session handler initialisation
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

    private setupDAO(client: MongoClient): void {
        for (const name in dao) {
            Logger.debug('dao', name);
            if (dao.hasOwnProperty(name)) {
                const element = (dao as any)[name];
                if (element.injectDB instanceof Function) {
                    element.injectDB(client);
                }
            }
        }
    }

    start(port: number): void {
        this.app.all('*', (req, res) => {
            res.send(this.SERVER_STARTED);
        });
        this.app.listen(port, () => {
            Logger.info(this.SERVER_STARTED, { port });
        });
    }
}
