"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = __importDefault(require("express-session"));
const MongoStore = require('connect-mongo')(express_session_1.default);
class PrdSession {
    static validateSession(req, res, next) {
        if (req.session && req.session.user) {
            next();
        }
        else {
            console.error('Not logged in');
            res.status(401).json(new Error('Not logged in'));
        }
    }
    static validateAdminSession(req, res, next) {
        if (req.session && req.session.user && req.session.user.admin) {
            next();
        }
        else {
            console.error('Admin not logged in');
            res.status(401).json(new Error('Admin not logged in'));
        }
    }
    static injectDB(conn) {
        const sessionStore = new MongoStore({ client: conn });
        console.log("session handler started");
        return express_session_1.default({
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
}
exports.default = PrdSession;
//# sourceMappingURL=session-handler.js.map