"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PrdServer_1 = __importDefault(require("./PrdServer"));
require("./lib/env");
const mysql_connector_1 = require("./lib/mysql-connector");
const mysqlPool = new mysql_connector_1.MysqlPool();
const prdServer = new PrdServer_1.default(mysqlPool);
prdServer.start(+process.env.PORT);
//# sourceMappingURL=start.js.map