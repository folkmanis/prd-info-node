"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
    username: String,
    name: String,
    password: String,
    admin: Boolean,
    last_login: Date,
});
//# sourceMappingURL=user-class.js.map