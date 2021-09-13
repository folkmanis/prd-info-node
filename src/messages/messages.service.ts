import { Collection, Db, ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

import { MessageBase } from './interfaces/message.interface';
import { SystemModules } from '../preferences';

@Injectable()
export class MessagesService {
  collection: Collection<MessageBase> = this.dbService
    .db()
    .collection('messages');

  constructor(private dbService: DatabaseService) {
    this.createIndexes();
  }

  async getMessages(
    to: Date,
    modules: SystemModules[],
    username: string,
  ): Promise<MessageBase[]> {
    const pipeline: any[] = [
      {
        $match: {
          timestamp: {
            $lte: to,
          },
          deletedBy: {
            $ne: username,
          },
        },
      },
      {
        $sort: {
          timestamp: -1,
        },
      },
      {
        $addFields: {
          seen: {
            $in: [username, '$seenBy'],
          },
          deleted: {
            $in: [username, '$deletedBy'],
          },
        },
      },
      {
        $project: {
          seenBy: 0,
          deletedBy: 0,
        },
      },
    ];
    if (modules.length > 0) {
      pipeline.push({
        $match: {
          module: { $in: modules },
        },
      });
    }

    return this.collection.aggregate(pipeline).toArray();
  }

  async add(msg: MessageBase): Promise<ObjectId> {
    const resp = await this.collection.insertOne(msg);
    return resp.insertedId;
  }

  async markAs(
    prop: 'seenBy' | 'deletedBy',
    user: string,
    filter: { _id?: ObjectId; } = {},
  ): Promise<number> {
    const resp = await this.collection.updateMany(filter, {
      $addToSet: {
        [prop]: user,
      },
    });
    return resp.modifiedCount;
  }

  private createIndexes() {
    this.collection.createIndexes([
      {
        key: {
          timestamp: -1,
        },
        expireAfterSeconds: 60 * 60 * 24 * 7,
      },
      {
        key: {
          action: 1,
        },
      },
      {
        key: {
          module: 1,
        },
      },
    ]);
  }
}
