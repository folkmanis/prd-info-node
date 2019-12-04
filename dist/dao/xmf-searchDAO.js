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
;
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
    static findJob(search, userPreferences) {
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
            const sort = {
                exactMatch: 1,
                "Archives.yearIndex": -1,
                "Archives.monthIndex": -1,
            };
            const result = { count: 0, data: [] };
            const filter = xmfSearchDAO.filter(search, userPreferences.customers);
            console.log(JSON.stringify(filter));
            const findRes = archives.find(filter);
            result.count = yield findRes
                .count();
            result.data = yield findRes
                .project(projection)
                .map(res => (Object.assign(Object.assign({}, res), { exactMatch: res.JDFJobID === search.q })))
                .sort(sort)
                .limit(100)
                .toArray();
            return result;
        });
    }
    static facet(search, userPreferences) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = xmfSearchDAO.filter(search, userPreferences.customers);
            const pipeline = [
                { $match: filter },
                {
                    $facet: {
                        customerName: [{ $sortByCount: '$CustomerName' }],
                        year: [
                            { $unwind: '$Archives' },
                            { $group: { _id: "$Archives.yearIndex", count: { $sum: 1 } } },
                            { $sort: { _id: -1 } },
                        ],
                        month: [
                            { $unwind: '$Archives' },
                            { $group: { _id: "$Archives.monthIndex", count: { $sum: 1 } } },
                            { $sort: { _id: 1 } },
                        ],
                    }
                }
            ];
            console.log(JSON.stringify(pipeline));
            const findres = archives.aggregate(pipeline);
            return (yield findres.toArray())[0];
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
    static filter(search, customers) {
        const filter = {
            $or: [
                { JDFJobID: search.q },
                { DescriptiveName: { $regex: search.q, $options: 'i' } },
            ]
        };
        filter.CustomerName = {
            $in: search.customers ? JSON.parse(search.customers) : customers
        };
        if (search.year) {
            filter["Archives.yearIndex"] = { $in: JSON.parse(search.year) };
        }
        if (search.month) {
            filter["Archives.monthIndex"] = { $in: JSON.parse(search.month) };
        }
        return filter;
    }
}
exports.default = xmfSearchDAO;
//# sourceMappingURL=xmf-searchDAO.js.map