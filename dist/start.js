"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/env");
const PrdServer_1 = require("./PrdServer");
const prdServer = new PrdServer_1.PrdServer();
prdServer.start(+process.env.PORT);
//# sourceMappingURL=start.js.map