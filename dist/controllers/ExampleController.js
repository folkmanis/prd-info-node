"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@overnightjs/core");
const logger_1 = require("@overnightjs/logger");
let ExampleController = class ExampleController {
    getMessage(req, res) {
        logger_1.Logger.Info(req.params.msg);
        res.status(200).json({
            message: req.params.msg,
        });
    }
    putMessage(req, res) {
        logger_1.Logger.Info(req.params.msg);
        return res.status(400).json({
            error: req.params.msg,
        });
    }
    postMessage(req, res) {
        logger_1.Logger.Info(req.params.msg);
        return res.status(400).json({
            error: req.params.msg,
        });
    }
    delMessage(req, res) {
        try {
            throw new Error(req.params.msg);
        }
        catch (err) {
            logger_1.Logger.Err(err, true);
            return res.status(400).json({
                error: req.params.msg,
            });
        }
    }
};
__decorate([
    core_1.Get(':msg')
], ExampleController.prototype, "getMessage", null);
__decorate([
    core_1.Put(':msg')
], ExampleController.prototype, "putMessage", null);
__decorate([
    core_1.Post(':msg')
], ExampleController.prototype, "postMessage", null);
__decorate([
    core_1.Delete(':msg')
], ExampleController.prototype, "delMessage", null);
ExampleController = __decorate([
    core_1.Controller('api')
], ExampleController);
exports.ExampleController = ExampleController;
//# sourceMappingURL=ExampleController.js.map