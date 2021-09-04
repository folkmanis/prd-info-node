import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../database';
import { Notification, NotificationModules } from '../notification';


@Injectable()
export class NotificationsDaoService {
    private collection: Collection<Notification> = this.dbServ.db().collection('notifications');

    constructor(
        private dbServ: DatabaseService,
    ) {
        this.createIndexes();
    }


    async getAll(
        from: Date,
        to: Date,
        modules: NotificationModules[],
        instanceId?: string
    ): Promise<Notification[]> {

        let filter: Record<string, any> = {
            timestamp: {
                $gt: from,
                $lte: to
            },
            instanceId: {
                $ne: instanceId,
            }
        };
        if (modules.length > 0) {
            filter = {
                ...filter,
                module: {
                    $in: modules as any,
                }
            };
        }
        return this.collection.find(filter).toArray();
    }

    async insertOne(notification: Notification): Promise<boolean> {
        const resp = await this.collection.insertOne(notification, { writeConcern: { w: 1 } });
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
