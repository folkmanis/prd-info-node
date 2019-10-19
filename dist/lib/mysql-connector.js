"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const logger_1 = require("@overnightjs/logger");
class MysqlPool {
    constructor() {
        logger_1.Logger.Info(`db_user: ${process.env.DB_USER}`);
        this.pool = mysql_1.default.createPool({
            connectionLimit: 5,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_BASE
        });
    }
    poolConnect() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.asyncConnection();
            res.on('close', () => conn.release());
            res.on('close', () => logger_1.Logger.Info('conn released'));
            req.sqlConnection = conn;
            next();
        });
    }
    asyncConnection() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                logger_1.Logger.Info('getConnection');
                if (err) {
                    reject(err);
                }
                else {
                    resolve(connection);
                }
            });
        });
    }
}
exports.MysqlPool = MysqlPool;
exports.asyncQuery = (conn, q, params) => {
    return new Promise((resolve, reject) => {
        conn.query(q, params, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
};
//# sourceMappingURL=mysql-connector.js.map