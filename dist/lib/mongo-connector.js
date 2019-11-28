"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import mongodb, { MongoClient } from 'mongodb';
const mongoose_1 = __importDefault(require("mongoose"));
class MongoConnector {
    constructor() {
        this.dbname = "prd_info";
        this.url = "mongodb://prdUser:9N0rqxG9KFQtosgp@192.168.8.53:27017"; // + this.dbname;
        this.auth = {
            user: "prdUser",
            password: "9N0rqxG9KFQtosgp",
        };
        mongoose_1.default.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        this.connection = mongoose_1.default.connection;
        this.connection.on('error', () => console.error('mongo connection error'));
        this.connection.once('open', () => console.log('mongo connected'));
    }
    connect() {
        return (req, res, next) => {
            req.mongo = this.connection;
            next();
        };
    }
}
exports.MongoConnector = MongoConnector;
//# sourceMappingURL=mongo-connector.js.map