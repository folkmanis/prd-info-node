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
const asyncWrapper_1 = require("../lib/asyncWrapper");
const session_handler_1 = require("../lib/session-handler");
const xmf_archive_class_1 = require("../lib/xmf-archive-class");
let XmfSearchController = class XmfSearchController {
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = { count: 0, data: [] };
            const q = req.query.q.trim();
            const filter = {
                $or: [
                    { DescriptiveName: { $regex: q, $options: 'i' } },
                    { JDFJobID: { $regex: q, $options: 'i' } },
                ]
            };
            if (req.query.customers) {
                filter.CustomerName = { $in: req.query.customers.split(',') };
            }
            const projection = '-_id JDFJobID DescriptiveName CustomerName Archives.Location Archives.Date Archives.Action';
            const mongo = req.mongo;
            const ArchiveJob = mongo.model('xmfArchive', xmf_archive_class_1.ArchiveJobSchema);
            result.count = yield ArchiveJob.countDocuments(filter);
            if (result.count === 0) {
                res.json(result);
                return;
            }
            result.data = yield ArchiveJob.find(filter, projection).limit(100).sort({ JDFJobID: 1 });
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