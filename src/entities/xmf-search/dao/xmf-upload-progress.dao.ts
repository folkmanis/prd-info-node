import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../../database';
import { StartLimit } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { XmfUploadProgress } from '../entities/xmf-upload-progress.entity';

@Injectable()
export class XmfUploadProgressDao {
  private collection: Collection<XmfUploadProgress> = this.dbService
    .db()
    .collection('xmf-upload-progress');

  constructor(private readonly dbService: DatabaseService) {}

  async insertOne(upload: XmfUploadProgress) {
    const { insertedId } = await this.collection.insertOne(upload);
    return insertedId;
  }

  async findAll({ start, limit }: StartLimit): Promise<XmfUploadProgress[]> {
    return this.collection
      .find(
        {},
        {
          skip: start,
          limit,
        },
      )
      .sort({ _id: -1 })
      .toArray();
  }
}
