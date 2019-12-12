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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = __importStar(require("body-parser"));
const controllers = __importStar(require("./controllers"));
const core_1 = require("@overnightjs/core");
const mongodb_1 = require("mongodb");
const session_handler_1 = __importDefault(require("./lib/session-handler"));
const usersDAO_1 = __importDefault(require("./dao/usersDAO"));
const xmf_searchDAO_1 = __importDefault(require("./dao/xmf-searchDAO"));
class PrdServer extends core_1.Server {
    constructor() {
        super(true);
        this.SERVER_STARTED = 'Server started on port: ';
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }
    connectDB(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!uri) {
                console.error('Mongo environment not defined');
                return process.exit(1);
            }
            console.log(uri);
            return mongodb_1.MongoClient.connect(uri, {
                poolSize: 50,
                authSource: "admin",
                useUnifiedTopology: true,
                useNewUrlParser: true,
                connectTimeoutMS: 5000,
                wtimeout: 2500,
            }).catch(err => {
                console.error(err.stack);
                return process.exit(1);
            }).then((client) => __awaiter(this, void 0, void 0, function* () {
                if (!client) {
                    console.error("No connection to mongod");
                    return process.exit(1);
                }
                console.log('Mongo connected');
                usersDAO_1.default.injectDB(client);
                xmf_searchDAO_1.default.injectDB(client);
                this.app.use(session_handler_1.default.injectDB(client));
                return client;
            }));
        });
    }
    setupControllers() {
        const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                const controller = controllers[name];
                ctlrInstances.push(new controller());
            }
        }
        super.addControllers(ctlrInstances);
    }
    start(port) {
        this.app.get('*', (req, res) => {
            res.send(this.SERVER_STARTED + port);
        });
        this.app.listen(port, () => {
            console.log(this.SERVER_STARTED + port);
        });
    }
}
exports.PrdServer = PrdServer;
//# sourceMappingURL=PrdServer.js.map