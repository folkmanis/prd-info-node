"use strict";
/**
 * Users administration
 *
 * GET /list
 * Full list of users
 * count: number total count
 * users: {id, username, name, admin, last_login}[]
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@overnightjs/core");
const logger_1 = require("@overnightjs/logger");
const mysql_connector_1 = require("../lib/mysql-connector");
const asyncWrapper_1 = require("../lib/asyncWrapper");
let UsersController = class UsersController {
    getList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.Info('users/list');
            res.result = {};
            res.result.count = +(yield mysql_connector_1.asyncQuery(req.sqlConnection, `SELECT COUNT(*) AS count FROM users`))[0].count;
            res.result.users = yield mysql_connector_1.asyncQuery(req.sqlConnection, `SELECT id, username, name, admin, last_login FROM users ORDER BY username`);
            res.json(res.result);
        });
    }
};
__decorate([
    core_1.Get('list')
], UsersController.prototype, "getList", null);
UsersController = __decorate([
    core_1.Controller('data/users'),
    core_1.ClassWrapper(asyncWrapper_1.asyncWrapper)
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users-controller.js.map