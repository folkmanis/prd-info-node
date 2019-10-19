"use strict";
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
let XmfSearchController = class XmfSearchController {
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = req.query.q;
            logger_1.Logger.Info('xmf search ' + q);
            if (q.length < 3) {
                logger_1.Logger.Info('Search too short');
                res.json({});
                return;
            }
            const qqq = `SELECT xmf_jobs.*, xmf_records.Location, xmf_records.Date, xmf_actions.Action FROM xmf_jobs
        LEFT JOIN xmf_records ON xmf_jobs.id = xmf_records.id
        LEFT JOIN xmf_actions ON xmf_records.Action = xmf_actions.id
        WHERE (xmf_jobs.DescriptiveName LIKE '%${q}%')
        OR (xmf_jobs.JDFJobID LIKE '%${q}%')
        ORDER BY xmf_jobs.JobID, xmf_jobs.id DESC;`;
            const result = yield mysql_connector_1.asyncQuery(req.sqlConnection, qqq);
            res.json(result);
        });
    }
};
__decorate([
    core_1.Get('search')
], XmfSearchController.prototype, "search", null);
XmfSearchController = __decorate([
    core_1.Controller('data/xmf-search')
    // @ClassMiddleware(PrdSession.validateSession)
    ,
    core_1.ClassWrapper(asyncWrapper_1.asyncWrapper)
], XmfSearchController);
exports.XmfSearchController = XmfSearchController;
//# sourceMappingURL=xmf-search-controller.js.map