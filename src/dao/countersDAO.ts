import {
  MongoClient,
  Collection,
  Db,
  ObjectId,
  BulkWriteOperation,
  BulkWriteOpResultObject,
} from 'mongodb';
import { CounterLastId, Counters, JobsSystemPreference } from '../interfaces';
import Logger from '../lib/logger';
import { Dao } from '../interfaces/dao.interface';

export const defaultValues: CounterLastId[] = [
  {
    counter: 'lastJobId',
    lastId: 50001,
  },
  {
    counter: 'lastInvoiceId',
    lastId: 10,
  },
];

export class CountersDao extends Dao {
  counters!: Collection<CounterLastId>;

  async injectDb(db: Db) {
    try {
      this.counters = db.collection('counters');
      this.insertDefaults(defaultValues);
      await this.counters.createIndex(
        { counter: 1 },
        { unique: true, name: 'counter_1' },
      );
    } catch (e) {
      Logger.error('Preferences DAO error', e);
    }
  }

  async getNextId(counter: Counters, nums = 1): Promise<number> {
    const result = (
      await this.counters.findOneAndUpdate(
        {
          counter,
        },
        {
          $inc: { lastId: nums },
        },
        {
          returnDocument: 'after',
          // returnOriginal: false,
        },
      )
    ).value;

    if (!result?.lastId) {
      throw new Error('nextId missing');
    }

    Logger.debug(`New Id for ${counter}`, result.lastId);
    return result.lastId;
  }

  private async insertDefaults(defaults: CounterLastId[]) {
    const lastIds = await this.counters.find({}).toArray();
    const missing: CounterLastId[] = this.filterMissingRecords(
      defaults,
      lastIds,
    );

    if (!missing.length) {
      return;
    }

    await this.counters.bulkWrite(this.createInsertForMissingRecords(missing));
  }

  filterMissingRecords(
    defaults: CounterLastId[],
    existing: CounterLastId[],
  ): CounterLastId[] {
    return defaults.filter(
      (def) => !existing.find((last) => last.counter === def.counter),
    );
  }

  createInsertForMissingRecords(
    missing: CounterLastId[],
  ): BulkWriteOperation<CounterLastId>[] {
    return missing.map((rec) => ({
      insertOne: {
        document: {
          counter: rec.counter,
          lastId: rec.lastId,
        },
      },
    }));
  }
}
