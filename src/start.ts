import './lib/env';
import { PrdServer } from './PrdServer';

const prdServer = new PrdServer();
prdServer.connectDB(process.env.DB_SRV as string)
    .then(() => prdServer.handleVersion())
    .then(() => prdServer.setupControllers())
    .then(() => prdServer.start(+(process.env.PORT as string)));
