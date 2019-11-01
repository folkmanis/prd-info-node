"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = __importStar(require("body-parser"));
const controllers = __importStar(require("./controllers"));
const core_1 = require("@overnightjs/core");
const logger_1 = require("@overnightjs/logger");
const mysql_connector_1 = require("./lib/mysql-connector");
const mongo_connector_1 = require("./lib/mongo-connector");
const session_handler_1 = require("./lib/session-handler");
class PrdServer extends core_1.Server {
    constructor() {
        super(true);
        this.SERVER_STARTED = 'Server started on port: ';
        this.mysqlPool = new mysql_connector_1.MysqlPool();
        this.mongo = new mongo_connector_1.MongoConnector();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(this.mysqlPool.poolConnect());
        // this.app.use(this.mongo.connect());
        this.app.use(session_handler_1.PrdSession.sessionHandler(this.mysqlPool));
        this.setupControllers();
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
            logger_1.Logger.Imp(this.SERVER_STARTED + port);
        });
    }
}
exports.PrdServer = PrdServer;
//# sourceMappingURL=PrdServer.js.map