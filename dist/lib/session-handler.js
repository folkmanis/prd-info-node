"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const session = require("express-session");
const express_mysql_session_1 = __importDefault(require("express-mysql-session"));
const logger_1 = require("@overnightjs/logger");
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
        if (req.session && req.session.user.admin) {
            next();
        }
        else {
            logger_1.Logger.Err('Admin not logged in');
            res.status(401).json(new Error('Admin not logged in'));
        }
    }
    PrdSession.validateAdminSession = validateAdminSession;
    function sessionHandler(mysqlPool) {
        let sessionStore = new express_mysql_session_1.default({}, mysqlPool.pool);
        return session({
            secret: 'HGG50EtOT7',
            store: sessionStore,
            cookie: {
                maxAge: (process.env.SESSION_EXPIRES ? +process.env.SESSION_EXPIRES : 259200) * 1000,
                httpOnly: true,
            },
            saveUninitialized: false,
            unset: 'destroy',
            resave: false,
        });
    }
    PrdSession.sessionHandler = sessionHandler;
})(PrdSession = exports.PrdSession || (exports.PrdSession = {}));
//# sourceMappingURL=session-handler.js.map