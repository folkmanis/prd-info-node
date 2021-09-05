import { Collection, Db, FilterQuery } from 'mongodb';
import { Dao, NotificationBase } from '../interfaces';
import Logger from '../lib/logger';

export class NotificationsDao extends Dao {
  private collection!: Collection<NotificationBase>;

  async injectDb(db: Db) {
    try {
      this.collection = db.collection('notifications');
      this.createIndexes();
    } catch (err: any) {
      Logger.error('Notifications DAO', err.message);
    }
  }

  async getAll(
    from: Date,
    to: Date,
    modules: string[],
    instanceId: string | undefined,
  ): Promise<NotificationBase[]> {
    let filter: FilterQuery<NotificationBase> = {
      timestamp: {
        $gt: from,
        $lte: to,
      },
      instanceId: {
        $ne: instanceId,
      },
    };
    if (modules.length > 0) {
      filter = {
        ...filter,
        module: {
          $in: modules,
        },
      };
    }
    return this.collection.find(filter).toArray();
  }

  async add(message: NotificationBase): Promise<boolean> {
    const resp = await this.collection.insertOne(message, {
      writeConcern: { w: 1 },
    });
    return resp.insertedCount > 0;
  }

  private createIndexes() {
    this.collection.createIndexes([
      {
        key: {
          timestamp: 1,
        },
        expireAfterSeconds: 60 * 5,
      },
    ]);
  }
}
