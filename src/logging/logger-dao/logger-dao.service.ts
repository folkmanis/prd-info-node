import { Injectable, Logger } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../database';
import { FilterType } from '../../lib/start-limit-filter/filter-type.interface';
import { LogRecord } from '../interfaces/log-record.interface';

@Injectable()
export class LoggerDaoService {
  private logger = new Logger(LoggerDaoService.name);

  private collection: Collection<LogRecord> = this.dbService
    .db()
    .collection('log');

  constructor(private dbService: DatabaseService) {
    this.createIndexes();
  }

  async insertOne(record: LogRecord) {
    return this.collection.insertOne(record, { writeConcern: { w: 0 } });
  }

  async readAll({
    limit,
    start,
    filter,
  }: FilterType<LogRecord>): Promise<LogRecord[]> {
    return this.collection
      .find(filter, {
        sort: { timestamp: -1 },
        skip: start,
        limit,
      })
      .toArray();
  }

  async countDocuments({ filter }: FilterType<LogRecord>): Promise<number> {
    return this.collection.countDocuments(filter);
  }

  async datesGroup({ filter }: FilterType<LogRecord>): Promise<string[]> {
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

  private async createIndexes() {
    try {
      await this.collection.createIndexes([
        {
          key: { timestamp: -1 },
          name: 'timestamp',
          expireAfterSeconds: 60 * 60 * 24 * 7,
        },
        {
          key: { level: 1 },
          name: 'level',
        },
      ]);
    } catch (error) {
      this.logger.error(error);
    }

    // DEBUG
    // this.collection.deleteMany({});
  }
}
