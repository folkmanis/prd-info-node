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
class MysqlPool {
    constructor() {
        this.mysqlPool = mysql_1.default.createPool({
            connectionLimit: 5,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_BASE
        });
    }
    getConnection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            req.sqlConnection = yield this.asyncGetConnection();
        });
    }
    asyncGetConnection() {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(connection);
                }
            });
        });
    }
    getContion() {
        return (req, res, next) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    next(err);
                }
                // console.log('connection: ', connection);
                // req.sqlConnection = connection;
                next();
            });
        };
    }
}
exports.MysqlPool = MysqlPool;
//# sourceMappingURL=mysql-connector.js.map