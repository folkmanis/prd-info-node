import { Collection, Db, FilterQuery, ObjectId, UpdateWriteOpResult, DeleteWriteOpResultObject } from 'mongodb';
import Logger from '../lib/logger';
import { Message, MessageBase, Modules } from '../interfaces';
import { Dao } from '../interfaces/dao.interface';


export class MessagesDao extends Dao {
    readonly COLLECTION_NAME = 'messages';

    collection!: Collection<MessageBase>;

    async injectDb(db: Db) {
        try {
            this.collection = db.collection(this.COLLECTION_NAME);
        } catch (error) {
            Logger.error('Messages DAO', error.message);
            return;
        }
        this.createIndexes();
    }

    async getMessages(from: Date, modules: Modules[]): Promise<MessageBase[]> {
        let filter: FilterQuery<MessageBase> = {
            timestamp: { $gt: from },
        };
        if (modules.length > 0) {
            filter = {
                ...filter,
                module: { $in: modules },
            };
        }
        return this.collection.find(filter).toArray();
    }

    async add(msg: MessageBase): Promise<boolean> {
        const resp = await this.collection.insertOne(msg);
        return resp.insertedCount > 0;
    }

    private createIndexes() {
        this.collection.createIndexes([
            {
                key: {
                    timestamp: 1
                },
                expireAfterSeconds: 60 * 60 * 24,
            },
            {
                key: {
                    action: 1
                },
            }
        ]);
    }

}