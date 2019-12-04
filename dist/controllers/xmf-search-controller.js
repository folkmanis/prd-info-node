"use strict";
/**
 * data/xmf-search/search?q=<string>&customers=<>&year=<>&date=<>
 * { count: number, data: {
 *          JDFJobID,
            DescriptiveName,
            CustomerName,
            "Archives.Location",
            "Archives.Date",
            "Archives.Action",
   }[] }
 *
 * data/xmf-search/facet?q=<string>&customers=<>&year=<>&date=<>
 *
 *  customerName: Count[],
    year: Count[],
    month: Count[],

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
const core_1 = require("@overnightjs/core");
const asyncWrapper_1 = require("../lib/asyncWrapper");
const session_handler_1 = __importDefault(require("../lib/session-handler"));
const preferences_handler_1 = __importDefault(require("../lib/preferences-handler"));
const xmf_searchDAO_1 = __importDefault(require("../dao/xmf-searchDAO"));
let XmfSearchController = class XmfSearchController {
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(JSON.parse(req.query.query));
            if (!req.query.query) { // ja nav jautājums
                res.json({ count: 0 }); // skaits 0
                return;
            }
            res.json(yield xmf_searchDAO_1.default.findJob(JSON.parse(req.query.query), req.userPreferences));
        });
    }
    facet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(JSON.parse(req.query.query));
            if (!req.query.query) { // ja nav jautājums
                res.json({}); // skaits 0
                return;
            }
            res.json(yield xmf_searchDAO_1.default.facet(JSON.parse(req.query.query), req.userPreferences));
        });
    }
};
__decorate([
    core_1.Get('search')
], XmfSearchController.prototype, "search", null);
__decorate([
    core_1.Get('facet')
], XmfSearchController.prototype, "facet", null);
XmfSearchController = __decorate([
    core_1.Controller('data/xmf-search'),
    core_1.ClassMiddleware([session_handler_1.default.validateSession, preferences_handler_1.default.getUserPreferences]),
    core_1.ClassWrapper(asyncWrapper_1.asyncWrapper)
], XmfSearchController);
exports.XmfSearchController = XmfSearchController;
//# sourceMappingURL=xmf-search-controller.js.map