import * as bodyParser from 'body-parser';
import { DaoIndexMap } from './dao/dao-map';
import { LoggerDao } from './dao';
import { createControllers } from './controllers/controllers-index';
import { Server } from '@overnightjs/core';

import { MongoClient } from 'mongodb';
import { PrdSession } from './lib/session-handler';
import { VersionHandler } from './lib/version-handler';
import Logger, { Console, MongoLog } from './lib/logger';
import { Application } from 'express';

import { insertDao as insertPreferencesHandlerDao } from './lib/preferences-handler';
import { messageHandler } from './lib/message-handler';
import { MessagesDao } from './dao/messagesDAO';

export class PrdServer extends Server {

    private readonly SERVER_STARTED = 'Server started';
    private daoMap = new DaoIndexMap();

    constructor() {
        super(true);
        Logger.addTransport(new Console());
        this.app.use(Logger.handler()); // Logger funkcijas būs pieejamas kā req.log
        this.app.set('trust proxy', true);
        this.app.use(bodyParser.json({ limit: process.env.BODY_SIZE_LIMIT }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    async connectDB(uri: string | undefined): Promise<MongoClient> {
        if (!uri) {
            Logger.error('Mongo environment not defined');  // Inicializācijas laikā lieto statisko objektu
            return process.exit(1);
        }
        try {
            const client = await MongoClient.connect(uri,
                {
                    poolSize: 50,
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    connectTimeoutMS: 5000,
                    writeConcern: {
                        wtimeout: 2500,
                    }
                },
            );
            Logger.debug('Mongo connected');
            this.setupDAO(client); // All DAO initialisation
            Logger.addTransport(
                new MongoLog(this.daoMap.getDao(LoggerDao))
            ); // Loggerim pievieno arī mongo izvadi

            insertPreferencesHandlerDao(this.daoMap);

            this.app.use(PrdSession.injectDB(uri)); // Session handler initialisation
            return client;

        } catch (err) {
            Logger.error('Error connecting to mongodb', err.stack);
            return process.exit(1);
        }
    }

    async handleVersion(): Promise<Application> {
        return new VersionHandler().initVersion()
            .then(vHandl => this.app.use(vHandl.handler()));
    }

    setupControllers(): void {
        super.addControllers(createControllers(this.daoMap));
    }

    setMessaging() {
        this.app.use(messageHandler(this.daoMap.getDao(MessagesDao)));
    }

    private setupDAO(client: MongoClient): void {

        const db = client.db(process.env.DB_BASE as string);

        this.daoMap.injectDb(db);

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
