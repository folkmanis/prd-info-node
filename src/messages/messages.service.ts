import { Injectable } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { from, Observable } from 'rxjs';
import { DatabaseService } from '../database/database.service';
import {
  NotificationsService,
  SystemNotification,
  Systemoperations,
} from '../notifications';
import { SystemModules } from '../preferences';
import { Message } from './entities';

@Injectable()
export class MessagesService {
  collection: Collection<Message> = this.dbService.db().collection('messages');

  constructor(
    private dbService: DatabaseService,
    private notifications: NotificationsService,
  ) {
    this.createIndexes();
  }

  async getMessages(
    to: Date,
    modules: SystemModules[],
    username: string,
  ): Promise<Message[]> {
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
      {
        $lookup: {
          from: 'customers',
          'let': {
            folder: { $arrayElemAt: ['$data.path', 0] },
            operation: '$data.operation',
            disabled: '$disabled',
          },
          pipeline: [
            {
              $match: {
                ftpUser: true,
                disabled: { $ne: true },
                $expr: {
                  $and: [
                    { $eq: ['$$folder', '$ftpUserData.folder'] },
                    { $eq: ['$$operation', 'add'] },
                  ]
                }
              }
            },
            {
              $project: {
                CustomerName: 1,
                code: 1,
                folder: '$$folder',
              }
            }
          ],
          as: 'ftpUsers'
        }
      },
    ];
    if (modules.length > 0) {
      pipeline.push({
        $match: {
          module: { $in: modules },
        },
      });
    }

    return this.collection.aggregate(pipeline).toArray() as Promise<Message[]>;
  }

  ftpFolderUploads(ftpFolder: string): Observable<Message[]> {
    const filter = {
      'data.operation': 'add',
      'data.path.0': ftpFolder
    };
    return from(
      this.collection.find(filter).toArray()
    );
  }

  async add(msg: Message): Promise<ObjectId> {
    const { insertedId } = await this.collection.insertOne(msg);
    const n = new SystemNotification({
      id: insertedId,
      operation: Systemoperations.MESSAGE_ADDED,
    });
    this.notifications.notify(n);
    return insertedId;
  }

  postMessage(msg: Message): Observable<ObjectId> {
    return from(this.add(msg));
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
