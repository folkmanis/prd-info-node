"use strict";
/**
 * /data/login
 *
 * POST /data/login/login
 * {
 * username: string;
 * pass: string;
 * }
 *
 * User
 *
 *
 * POST /data/login/logout
 * {}
 *
 * GET /data/login/user
 * export interface User {
 *   id: number;
 *   username: string;
 *   name: string;
 *   admin: boolean;
 *   lastlogin?: Date;
 * } | {}
 *
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const core_1 = require("@overnightjs/core");
const logger_1 = require("@overnightjs/logger");
const mysql_connector_1 = require("../lib/mysql-connector");
const asyncWrapper_1 = require("../lib/asyncWrapper");
let LoginController = class LoginController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => {
                if (!req.session) { // Ja sesijas nav, tad neko nedara
                    resolve();
                    return;
                }
                req.session.regenerate((err) => {
                    err ? reject(err) : resolve();
                });
            });
            const q = `SELECT id, name, username, admin FROM users WHERE username=? AND password=UNHEX(SHA(?))`;
            const result = yield mysql_connector_1.asyncQuery(req.sqlConnection, q, [req.body.username, req.body.pass]);
            if (result.length < 1) {
                logger_1.Logger.Err('Login failed. User: ' + req.body.username + ' pwd: ' + req.body.pass);
                res.status(401).json({});
            }
            else if (req.session) {
                req.session.user = result[0];
                yield mysql_connector_1.asyncQuery(req.sqlConnection, `UPDATE users SET last_login=UTC_TIMESTAMP() WHERE id=?`, [result[0].id]);
                logger_1.Logger.Info('Logged in. User: ' + req.session.user.username);
                res.json(req.session.user);
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.Info('logout');
            const result = yield new Promise((resolve, reject) => {
                if (req.session) {
                    req.session.destroy((err) => {
                        err ? reject(err) : resolve({ affectedRows: 1 });
                    });
                }
                else {
                    resolve({ affectedRows: 0 });
                }
            });
            res.json(result);
        });
    }
    user(req, res) {
        if (req.session && req.session.user) {
            res.json(req.session.user);
        }
        else {
            res.json({});
        }
    }
};
__decorate([
    core_1.Post('login'),
    core_1.Wrapper(asyncWrapper_1.asyncWrapper)
], LoginController.prototype, "login", null);
__decorate([
    core_1.Post('logout'),
    core_1.Wrapper(asyncWrapper_1.asyncWrapper)
], LoginController.prototype, "logout", null);
__decorate([
    core_1.Get('user')
], LoginController.prototype, "user", null);
LoginController = __decorate([
    core_1.Controller('data/login')
], LoginController);
exports.LoginController = LoginController;
//# sourceMappingURL=login-controller.js.map