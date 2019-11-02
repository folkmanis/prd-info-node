"use strict";
/**
 * /data/xmf-upload/
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@overnightjs/core");
const asyncWrapper_1 = require("../lib/asyncWrapper");
const session_handler_1 = require("../lib/session-handler");
const upload_parser_1 = require("../lib/upload-parser");
const busboy_1 = __importDefault(require("busboy"));
const readline_1 = __importDefault(require("readline"));
let XmfUploadController = class XmfUploadController {
    file(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.result = {
                body: req.body,
                method: req.method,
                headers: req.headers,
            };
            const busboy = new busboy_1.default({ headers: req.headers });
            const parser = new upload_parser_1.UploadParser(req.sqlConnection, req.mongo);
            busboy.on('file', (fieldname, file, filename) => __awaiter(this, void 0, void 0, function* () {
                var e_1, _a;
                res.result.filename = filename;
                res.result.fieldname = fieldname;
                const rl = readline_1.default.createInterface({ input: file, crlfDelay: Infinity });
                try {
                    for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
                        const line = rl_1_1.value;
                        parser.parseLine(line);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield _a.call(rl_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }));
            busboy.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                res.result.data = parser.counter;
                res.json(res.result);
            }));
            req.pipe(busboy);
        });
    }
};
__decorate([
    core_1.Post('file')
], XmfUploadController.prototype, "file", null);
XmfUploadController = __decorate([
    core_1.Controller('data/xmf-upload'),
    core_1.ClassMiddleware(session_handler_1.PrdSession.validateSession),
    core_1.ClassWrapper(asyncWrapper_1.asyncWrapper)
], XmfUploadController);
exports.XmfUploadController = XmfUploadController;
//# sourceMappingURL=xmf-upload-controller.js.map