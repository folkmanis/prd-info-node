"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
;
exports.ArchiveJobSchema = new mongoose_1.Schema({
    JobID: String,
    JDFJobID: String,
    Comment: String,
    DescriptiveName: String,
    CustomerName: String,
    Company: String,
    BillingCode: String,
    FirstStart: String,
    LastEnd: String,
    Deleted: String,
    Secondary: Boolean,
    Archives: [{
            Action: Number,
            Status: Number,
            Location: String,
            DbConvVn: String,
            ArchiveContent: Number,
            Date: String,
            Online: Boolean,
            Percent: Number,
            Reason: String,
            Extra: String,
            JobID: String,
        }],
});
class XmfArchiveInfo {
}
exports.XmfArchiveInfo = XmfArchiveInfo;
//# sourceMappingURL=xmf-archive-class.js.map