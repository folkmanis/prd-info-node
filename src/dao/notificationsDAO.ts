import { Collection, Db, FilterQuery, ObjectId, UpdateWriteOpResult, DeleteWriteOpResultObject } from 'mongodb';
import Logger from '../lib/logger';
import { Dao, NotificationBase, Modules, MessageBase } from '../interfaces';

export class NotificationsDao extends Dao {
    private collection!: Collection<NotificationBase>;

    async injectDb(db: Db) {
        try {
            this.collection = db.collection('notifications');
            this.createIndexes();
        } catch (error) {
            Logger.error('Notifications DAO', error.message);
        }
    }

    async getAll(from: Date, to: Date, modules: string[]): Promise<NotificationBase[]> {
        let filter: FilterQuery<NotificationBase> = {
            timestamp: {
                $gt: from,
                $lte: to
            },
        };
        if (modules.length > 0) {
            filter = {
                ...filter,
                module: {
                    $in: modules,
                }
            };
        }
        return this.collection.find(filter).toArray();
    }

    async add(message: NotificationBase): Promise<boolean> {
        const resp = await this.collection.insertOne(message, { writeConcern: { w: 1 } });
        return resp.insertedCount > 0;
    }

    private createIndexes() {
        this.collection.createIndexes([
            {
                key: {
                    timestamp: 1,
                },
                expireAfterSeconds: 60 * 5,
            }
        ]);
    }
}