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
let archives;
class xmfSearchDAO {
    static injectDB(conn) {
        return __awaiter(this, void 0, void 0, function* () {
            if (archives) {
                return;
            }
            try {
                archives = conn.db(process.env.DB_BASE)
                    .collection('xmfarchives');
            }
            catch (e) {
                console.error(`xmfSearchDAO: unable to connect ${e}`);
            }
        });
    }
    static findJob(text, customers) {
        return __awaiter(this, void 0, void 0, function* () {
            const projection = {
                _id: 0,
                JDFJobID: 1,
                DescriptiveName: 1,
                CustomerName: 1,
                "Archives.Location": 1,
                "Archives.Date": 1,
                "Archives.Action": 1,
            };
            const result = { count: 0, data: [] };
            const filter = {
                $or: [
                    { DescriptiveName: { $regex: text, $options: 'i' } },
                    { JDFJobID: { $regex: text, $options: 'i' } },
                ]
            };
            if (customers) {
                filter.CustomerName = { $in: customers.split(',') };
            }
            console.log(JSON.stringify(filter));
            const findRes = archives.find(filter);
            result.count = yield findRes
                .count();
            result.data = yield findRes
                .project(projection)
                .limit(100)
                .toArray();
            return result;
        });
    }
    static insertJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {
                JobID: job.JobID,
                JDFJobID: job.JDFJobID,
            };
            // TODO optimizēt
            try {
                const updResult = yield archives.updateOne(filter, { $set: job }, { upsert: true });
                return { modified: updResult.modifiedCount, upserted: updResult.upsertedCount };
            }
            catch (e) {
                console.log('error: ', e);
                return { modified: 0, upserted: 0 };
            }
        });
    }
}
exports.default = xmfSearchDAO;
//# sourceMappingURL=xmf-searchDAO.js.map