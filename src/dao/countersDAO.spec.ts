import {
  MongoClient,
  Collection,
  ObjectId,
  BulkWriteOperation,
  BulkWriteOpResultObject,
  Db,
} from 'mongodb';
import { countersDAO, defaultValues } from './countersDAO';
import { CounterLastId } from '../interfaces';

const existing: CounterLastId[] = [
  {
    counter: 'lastJobId',
    lastId: 50001,
  },
];

const missing: CounterLastId[] = [
  {
    counter: 'lastInvoiceId',
    lastId: 10,
  },
];

const missingsUpdate: BulkWriteOperation<CounterLastId>[] = [
  {
    insertOne: {
      document: {
        counter: 'lastInvoiceId',
        lastId: 10,
      },
    },
  },
];

describe('create counters collection', () => {
  it('should find missing records', () => {
    expect(countersDAO.filterMissingRecords(defaultValues, existing)).toEqual(
      missing,
    );
  });

  it('should create db instructions for missing items', () => {
    let records = countersDAO.filterMissingRecords(defaultValues, existing);
    expect(countersDAO.createInsertForMissingRecords(records)).toEqual(
      missingsUpdate,
    );
  });
});
