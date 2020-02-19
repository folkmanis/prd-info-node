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
    exactMatch?: boolean;
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
    yearIndex?: number;
    monthIndex?: number;
};

export interface ArchiveSearchParams {
    q: string;
    customerName?: string;
    year?: string;
    month?: string;
}

export interface ArchiveSearchResult {
    count: number;
    data: Partial<ArchiveJob>[];
    facet: FacetResult;
}

interface Count { _id: string, count: number };

export interface FacetResult {
    customerName: Count[],
    year: Count[],
    month: Count[],
}
