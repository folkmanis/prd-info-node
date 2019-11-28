"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/env");
const PrdServer_1 = require("./PrdServer");
const prdServer = new PrdServer_1.PrdServer();
prdServer.connectDB(process.env.DB_SRV)
    .then(() => prdServer.setupControllers())
    .then(() => prdServer.start(+process.env.PORT));
//# sourceMappingURL=start.js.map