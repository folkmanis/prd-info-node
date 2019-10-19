import './lib/env';
import { PrdServer } from './PrdServer';

const prdServer = new PrdServer();
prdServer.start(+(process.env.PORT as string));
