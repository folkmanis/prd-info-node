import { Schema, Document } from 'mongoose';

export interface ArchiveJob extends Document {
    JobID: string;
    JDFJobID: string;
    Comment: string;
    DescriptiveName: string;
    CustomerName: string;
    Company: string;
    BillingCode: string;
    FirstStart: string;
    LastEnd: string;
    Deleted: string;
    Secondary: boolean;
    Archives: Archive[];
};

interface Archive extends Document {
    Action: number;
    Status: number;
    Location: string;
    DbConvVn: string;
    ArchiveContent: number;
    Date: string;
    Online: boolean;
    Percent: number;
    Reason: string;
    Extra: string;
    JobID: string;
};

export const ArchiveJobSchema = new Schema({
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
})


export class XmfArchiveInfo {
    [key: string]: string | boolean | number | Array<XmfArchive>
}

export interface XmfArchive {
    [key: string]: string | boolean | number
}

