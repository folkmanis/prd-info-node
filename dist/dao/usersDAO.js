"use strict";
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
let users;
class UsersDAO {
    static injectDB(conn) {
        return __awaiter(this, void 0, void 0, function* () {
            if (users) {
                return;
            }
            try {
                users = conn.db(process.env.DB_BASE).collection("users");
                console.log("users collection injected");
            }
            catch (e) {
                console.error(`usersDAO: unable to connect ${e}`);
            }
        });
    }
    static total() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield users.countDocuments({});
        });
    }
    static list() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield users.find({})
                .project(UsersDAO.projection).toArray();
        });
    }
    static getUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield users.findOne({ username });
        });
    }
    static addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield users.insertOne(user, { w: 'majority' });
                return { success: true };
            }
            catch (error) {
                return { error };
            }
        });
    }
    static updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user.username) { // Ja nav lietotājvārds, tad neko nedara
                const error = "User not defined";
                console.log(error);
                return { success: false, error };
            }
            try {
                const updResp = yield users.updateOne({ username: user.username }, { $set: user }, { w: 'majority' });
                if (updResp.matchedCount === 0) {
                    const error = "User not found";
                    console.log(error);
                    return { success: false, error };
                }
                return { success: true };
            }
            catch (error) {
                console.error("User update error ", error);
                return { success: false, error };
            }
        });
    }
    static login(login) {
        return __awaiter(this, void 0, void 0, function* () {
            const updResp = yield users.findOneAndUpdate(login, { $set: { last_login: new Date() } }, { projection: UsersDAO.projection });
            return updResp.value || null;
        });
    }
    static getPreferences(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UsersDAO.getUser(username);
            if (!user) {
                return null;
            }
            else {
                return user.preferences || null;
            }
        });
    }
}
exports.default = UsersDAO;
UsersDAO.projection = {
    _id: 0,
    username: 1,
    name: 1,
    admin: 1,
    last_login: 1,
};
//# sourceMappingURL=usersDAO.js.map