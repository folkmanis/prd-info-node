import { MongoClient, Collection, ObjectId, BulkWriteOperation, BulkWriteOpResultObject } from "mongodb";
import { CounterLastId, Counters, JobsSystemPreference } from '../interfaces';
import Logger from '../lib/logger';

export const defaultValues: CounterLastId[] = [
    {
        counter: 'lastJobId',
        lastId: 50001,
    },
    {
        counter: 'lastInvoiceId',
        lastId: 10,
    }
];

let counters: Collection<CounterLastId>;

export class countersDAO {
    static async injectDB(conn: MongoClient) {
        if (counters) {
            return;
        }
        try {
            counters = conn.db() // process.env.DB_BASE as string
                .collection('counters');
            countersDAO.insertDefaults(defaultValues);
            await counters.createIndex(
                { counter: 1 },
                { unique: true, name: 'counter_1' }
            );
            Logger.debug('Preferences DAO started');
        } catch (e) {
            Logger.error('Preferences DAO error', e);
        }
    }

    static async getNextId(counter: Counters, nums = 1): Promise<number> {
        const result = (await counters.findOneAndUpdate({
            counter,
        }, {
            $inc: { lastId: nums }
        }, {
            returnOriginal: false,
        })).value;

        if (!result?.lastId) { throw new Error('nextId missing'); }

        Logger.debug(`New Id for ${counter}`, result.lastId);
        return result.lastId;
    }


    private static async insertDefaults(defaults: CounterLastId[]) {
        const lastIds = await counters.find({}).toArray();
        const missing: CounterLastId[] = this.filterMissingRecords(defaults, lastIds);

        if (!missing.length) { return; }

        await counters.bulkWrite(this.createInsertForMissingRecords(missing));
    }

    static filterMissingRecords(defaults: CounterLastId[], existing: CounterLastId[]): CounterLastId[] {
        return defaults.filter(def => !existing.find(last => last.counter === def.counter));
    }

    static createInsertForMissingRecords(missing: CounterLastId[]): BulkWriteOperation<CounterLastId>[] {
        return missing.map(rec => ({
            insertOne: {
                document: {
                    counter: rec.counter,
                    lastId: rec.lastId,
                }
            }
        }));
    }

}