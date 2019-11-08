"use strict";
/**
 * Users administration
 *
 * GET /list
 * Full list of users
 * count: number total count
 * users: {id, username, name, admin, last_login}[]
 *
 * POST /user
 * Update/insert user
 *  {
 *   username: string,
 *   name: string,
 *   password: string,
 *   admin: boolean,
 *   last_login: Date,
 *  }
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
const logger_1 = require("@overnightjs/logger");
const asyncWrapper_1 = require("../lib/asyncWrapper");
const user_class_1 = require("../lib/user-class");
const session_handler_1 = require("../lib/session-handler");
let UsersController = class UsersController {
    getList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.Info('users/list');
            res.result = {};
            const User = req.mongo.model('users', user_class_1.UserSchema);
            res.result.count = yield User.estimatedDocumentCount();
            res.result.users = yield User.find({}, '-_id username name admin last_login');
            res.json(res.result);
        });
    }
    postUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.Info('users/update');
            const user = req.body;
            const mongo = req.mongo;
            const userModel = mongo.model('users', user_class_1.UserSchema);
            user.password = crypto_1.default.createHash('sha256').update(req.body.password).digest('hex');
            const result = yield userModel.updateOne({ username: user.username }, user, { upsert: true });
            console.log(result);
            res.json(result);
        });
    }
};
__decorate([
    core_1.Get('list')
], UsersController.prototype, "getList", null);
__decorate([
    core_1.Post('user')
], UsersController.prototype, "postUser", null);
UsersController = __decorate([
    core_1.Controller('data/users'),
    core_1.ClassMiddleware(session_handler_1.PrdSession.validateAdminSession),
    core_1.ClassWrapper(asyncWrapper_1.asyncWrapper)
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users-controller.js.map