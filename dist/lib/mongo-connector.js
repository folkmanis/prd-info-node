"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class MongoConnector {
    constructor() {
        this.dbname = "prd_info";
        this.url = "mongodb://prdUser:9N0rqxG9KFQtosgp@192.168.8.53:27017/prd_info"; // + this.dbname;
        this.auth = {
            user: "prdUser",
            password: "9N0rqxG9KFQtosgp",
        };
        this.client = new mongodb_1.MongoClient(this.url, {
            // auth: this.auth,
            useUnifiedTopology: true,
        });
        this.clientConnect();
    }
    clientConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.connect();
            console.log('mongo connected');
        });
    }
    connect() {
        return (req, res, next) => {
            mongodb_1.MongoClient.connect(this.url, {
                auth: this.auth,
                useUnifiedTopology: true,
                useNewUrlParser: true,
            }, (err, client) => {
                if (err) {
                    next(err);
                }
                req.mongo = client;
                console.log('mongo connected');
                res.on('close', () => {
                    client.close();
                    console.log('mongo released');
                });
                next();
            });
        };
    }
}
exports.MongoConnector = MongoConnector;
//# sourceMappingURL=mongo-connector.js.map