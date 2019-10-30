"use strict";
/**
 * data/xmf-search/search?q=<string>
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
const session_handler_1 = require("../lib/session-handler");
let XmfSearchController = class XmfSearchController {
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = '%' + req.query.q.trim() + '%';
            const params = [q, q];
            let where = `WHERE ((xmf_jobs.DescriptiveName LIKE ?)
        OR (xmf_jobs.JDFJobID LIKE ?))`;
            if (req.query.customers) {
                params.push(req.query.customers.split(','));
                where += ` AND xmf_jobs.CustomerName IN (?)`;
            }
            if (req.query.q.length < 4) {
                logger_1.Logger.Info('Search too short');
                res.json({ count: -1 });
                return;
            }
            const result = { count: 0, data: [] };
            const c = yield mysql_connector_1.asyncQuery(req.sqlConnection, `SELECT COUNT(*) AS count FROM xmf_jobs ${where}`, params);
            result.count = c[0].count;
            if (result.count === 0) {
                res.json(result);
                return;
            }
            const qqq = `SELECT
        xmf_jobs.id AS id,
        xmf_jobs.JDFJobID AS jdfJobId,
        xmf_jobs.DescriptiveName AS descriptiveName,
        xmf_jobs.CustomerName AS customerName,
        xmf_records.Location AS location,
        xmf_records.Date AS date,
        xmf_actions.Action AS action  
    FROM
        xmf_jobs
    LEFT JOIN
        xmf_records
    ON
        xmf_jobs.id = xmf_records.id
    LEFT JOIN
        xmf_actions
    ON
        xmf_records.Action = xmf_actions.id
    ${where}
    ORDER BY
        xmf_jobs.JobID,
        xmf_jobs.id
    DESC
    LIMIT 100`;
            result.data = yield mysql_connector_1.asyncQuery(req.sqlConnection, qqq, params);
            res.json(result);
        });
    }
};
__decorate([
    core_1.Get('search')
], XmfSearchController.prototype, "search", null);
XmfSearchController = __decorate([
    core_1.Controller('data/xmf-search'),
    core_1.ClassMiddleware(session_handler_1.PrdSession.validateSession),
    core_1.ClassWrapper(asyncWrapper_1.asyncWrapper)
], XmfSearchController);
exports.XmfSearchController = XmfSearchController;
//# sourceMappingURL=xmf-search-controller.js.map