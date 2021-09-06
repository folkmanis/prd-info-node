import { Injectable } from '@nestjs/common';
import { Collection, FilterQuery } from 'mongodb';
import { DatabaseService } from '../../database';
import { LogReadResponse, LogRecord } from '../interfaces/log-record.interface';
import { LogQuery } from '../interfaces/log-query.class';

@Injectable()
export class LoggerDaoService {


    private collection: Collection<LogRecord> = this.dbService.db().collection('log');

    constructor(
        private dbService: DatabaseService,
    ) {
        this.createIndexes();
    }


    async insertOne(record: LogRecord) {
        return this.collection.insertOne(record, { writeConcern: { w: 0 } });
    }

    async read({ dateFrom, dateTo, limit, start, level }: LogQuery): Promise<LogReadResponse> {
        const filter: FilterQuery<LogRecord> = {
            $and: [
                { timestamp: { $lte: dateTo } },
                { timestamp: { $gte: dateFrom } },
            ],
            level: { $lte: level },
        };
        const resp = this.collection
            .find(filter)
            .sort({ timestamp: 1 });
        return {
            totalCount: await resp.count(),
            logRecords: await resp.skip(start).limit(limit).toArray(),
        };
    }

    async datesGroup({ dateFrom, dateTo, limit, start, level }: LogQuery): Promise<string[]> {

        const pipeline: Array<any> = [
            {
                $match: {
                    $and: [
                        { timestamp: { $lte: dateTo } },
                        { timestamp: { $gte: dateFrom } },
                    ],
                    level: { $lte: level },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            date: '$timestamp',
                            format: '%Y-%m-%d',
                        },
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ];
        const resp = await this.collection.aggregate<Record<'_id', string>>(pipeline).toArray();
        return resp.map(val => val._id);
    }

    private createIndexes() {
        this.collection.createIndexes([
            {
                key: { timestamp: -1 },
                name: 'timestamp',
            },
            {
                key: { level: 1 },
                name: 'level',
            },
            { key: { info: 1 } },
        ]);
    }
}

