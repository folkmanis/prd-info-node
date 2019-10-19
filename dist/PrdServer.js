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
const controllers = __importStar(require("./controllers/ExampleController"));
const core_1 = require("@overnightjs/core");
const logger_1 = require("@overnightjs/logger");
class PrdServer extends core_1.Server {
    constructor(mysqlPool) {
        super(true);
        this.SERVER_STARTED = 'Server started on port: ';
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
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
            logger_1.Logger.Info(`db_user: ${process.env.DB_USER}`);
        });
    }
}
exports.default = PrdServer;
//# sourceMappingURL=PrdServer.js.map