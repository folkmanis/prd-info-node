import { ObjectId } from 'mongodb';

export interface ArchiveJob {
  _id: ObjectId;
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
  exactMatch?: boolean;
}

interface Archive {
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
  yearIndex?: number;
  monthIndex?: number;
}
