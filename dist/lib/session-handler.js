"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const session = require("express-session");
const logger_1 = require("@overnightjs/logger");
const MongoStore = require('connect-mongo')(session);
var PrdSession;
(function (PrdSession) {
    function validateSession(req, res, next) {
        if (req.session && req.session.user) {
            next();
        }
        else {
            logger_1.Logger.Err('Not logged in');
            res.status(401).json(new Error('Not logged in'));
            // next(new Error('Not logged in'))
        }
    }
    PrdSession.validateSession = validateSession;
    function validateAdminSession(req, res, next) {
        if (req.session && req.session.user && req.session.user.admin) {
            next();
        }
        else {
            logger_1.Logger.Err('Admin not logged in');
            res.status(401).json(new Error('Admin not logged in'));
        }
    }
    PrdSession.validateAdminSession = validateAdminSession;
    function sessionHandlerMongo(conn) {
        const sessionStore = new MongoStore({ mongooseConnection: conn });
        return session({
            secret: 'HGG50EtOT7',
            store: sessionStore,
            cookie: {
                maxAge: (process.env.SESSION_EXPIRES ? +process.env.SESSION_EXPIRES : 259200) * 1000,
                httpOnly: true,
                sameSite: true,
            },
            saveUninitialized: false,
            unset: 'destroy',
            resave: false,
        });
    }
    PrdSession.sessionHandlerMongo = sessionHandlerMongo;
})(PrdSession = exports.PrdSession || (exports.PrdSession = {}));
//# sourceMappingURL=session-handler.js.map