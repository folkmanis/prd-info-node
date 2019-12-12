"use strict";
/**
 * /data/login
 *
 * POST /data/login/login
 * {
 * username: string;
 * password: string;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const core_1 = require("@overnightjs/core");
const usersDAO_1 = __importDefault(require("../dao/usersDAO"));
let LoginController = class LoginController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.username || !req.body.password) { // Ja nepareizs pieprasījums
                res.status(401).json({});
                return;
            }
            yield new Promise((resolve, reject) => {
                if (!req.session) { // Ja sesijas nav, tad neko nedara
                    resolve();
                    return;
                }
                req.session.regenerate((err) => {
                    err ? reject(err) : resolve();
                });
            });
            const login = {
                username: req.body.username,
                password: crypto_1.default.createHash('sha256').update(req.body.password).digest('hex'),
            };
            let user = yield usersDAO_1.default.login(login);
            if (!user) {
                console.error('Login failed. User: ' + req.body.username + ' pwd: ' + req.body.pass);
                res.status(401).json({});
                return;
            }
            if (req.session) {
                req.session.user = user;
            }
            console.log('session', req.session);
            res.json(user);
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('logout');
            const result = yield new Promise((resolve, reject) => {
                if (req.session) {
                    req.session.destroy((err) => {
                        err ? reject(err) : resolve({ logout: 1 });
                    });
                }
                else {
                    resolve({ logout: 0 });
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
    core_1.Post('login')
], LoginController.prototype, "login", null);
__decorate([
    core_1.Post('logout')
], LoginController.prototype, "logout", null);
__decorate([
    core_1.Get('user')
], LoginController.prototype, "user", null);
LoginController = __decorate([
    core_1.Controller('data/login')
], LoginController);
exports.LoginController = LoginController;
//# sourceMappingURL=login-controller.js.map