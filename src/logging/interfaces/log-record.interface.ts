export interface LogRecord {
    level: number;
    timestamp: Date;
    info: string;
    metadata?: Record<string, any>;
}

export interface LogReadResponse {
    totalCount: number;
    logRecords: LogRecord[];
}

