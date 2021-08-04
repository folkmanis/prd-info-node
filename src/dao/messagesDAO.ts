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

    async getMessages(from: Date, to: Date, modules: Modules[], username: string): Promise<MessageBase[]> {
        const pipeline: any[] = [
            {
                $match: {
                    timestamp: {
                        $gt: from,
                        $lte: to
                    },
                }
            },
            {
                $sort: {
                    timestamp: -1
                }
            },
            {
                $addFields: {
                    seen: {
                        $in: [username, '$seenBy']
                    },
                    deleted: {
                        $in: [username, '$deletedBy']
                    }
                }
            },
            {
                $project: {
                    seenBy: 0,
                    deletedBy: 0,
                }
            },
        ];
        if (modules.length > 0) {
            pipeline.push({
                $match: {
                    module: { $in: modules }
                }
            });
        }

        return this.collection.aggregate(pipeline).toArray();
    }

    async add(msg: MessageBase): Promise<ObjectId> {
        const resp = await this.collection.insertOne(msg);
        return resp.insertedId;
    }

    async allMessagesRead(user: string): Promise<number> {
        const resp = await this.collection.updateMany(
            {},
            {
                $addToSet: {
                    seenBy: user,
                }
            }
        );
        return resp.modifiedCount;
    }

    private createIndexes() {
        this.collection.createIndexes([
            {
                key: {
                    timestamp: -1
                },
            },
            {
                key: {
                    action: 1
                },
            },
            {
                key: {
                    module: 1
                }
            }
        ]);
    }

}