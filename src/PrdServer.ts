import * as bodyParser from 'body-parser';
import * as controllers from './controllers';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';

import { MysqlPool } from './lib/mysql-connector';
import {MongoConnector} from './lib/mongo-connector';
import { PrdSession } from './lib/session-handler';

export class PrdServer extends Server {

    private readonly SERVER_STARTED = 'Server started on port: ';
    private mysqlPool: MysqlPool = new MysqlPool();
    private mongo: MongoConnector = new MongoConnector();

    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(this.mysqlPool.poolConnect());
        this.app.use(this.mongo.connect());
        this.app.use(PrdSession.sessionHandlerMongo(this.mongo.connection));
        // this.app.use(PrdSession.sessionHandler(this.mysqlPool));
        this.setupControllers();
    }
    private setupControllers(): void {
        const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                const controller = (controllers as any)[name];
                ctlrInstances.push(new controller());
            }
        }
        super.addControllers(ctlrInstances);
    }

    public start(port: number): void {
        this.app.get('*', (req, res) => {
            res.send(this.SERVER_STARTED + port);
        });
        this.app.listen(port, () => {
            Logger.Imp(this.SERVER_STARTED + port);
        });
    }
}
