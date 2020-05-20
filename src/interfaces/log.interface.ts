export interface LogRecord {
    level: number,
    timestamp: Date,
    info: string,
    metadata?: { [key: string]: any; },
}

export interface LogReadResponse {
    count: number,
    data: LogRecord[],
}

export interface DatesGroup {
    _id: string,
}
