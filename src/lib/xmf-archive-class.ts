export interface ArchiveJob {
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
};
