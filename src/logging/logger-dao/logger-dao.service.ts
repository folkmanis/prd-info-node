import { Inject, Injectable } from '@nestjs/common';
import { Collection, Filter } from 'mongodb';
import { DatesGroup } from '../interfaces/dates-group.schema.js';
import { LogQuery } from '../interfaces/log-query.schema.js';
import { LogRecord } from '../interfaces/log-record.schema.js';
import { LOG_COLLECTION } from './log-collection.provider.js';

@Injectable()
export class LoggerDaoService {
  constructor(
    @Inject(LOG_COLLECTION) private collection: Collection<LogRecord>,
  ) {}

  async insertOne(record: LogRecord) {
    return this.collection.insertOne(record, { writeConcern: { w: 0 } });
  }

  async readAll({ limit, start, filter }: LogQuery): Promise<LogRecord[]> {
    return this.collection
      .find(filter, {
        sort: { timestamp: -1 },
        skip: start,
        limit,
      })
      .toArray();
  }

  async datesGroup(filter: Filter<LogRecord>): Promise<DatesGroup[]> {
    const pipeline: Array<any> = [
      {
        $match: filter,
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
    const resp = await this.collection
      .aggregate<Record<'_id', string>>(pipeline)
      .toArray();
    return resp.map((val) => val._id);
  }
}
