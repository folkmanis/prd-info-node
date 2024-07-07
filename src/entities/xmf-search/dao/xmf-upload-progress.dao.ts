import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../../database/index.js';
import { StartLimit } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { XmfUploadProgress } from '../entities/xmf-upload-progress.entity.js';

@Injectable()
export class XmfUploadProgressDao {
  private collection: Collection<XmfUploadProgress>;

  constructor(dbService: DatabaseService) {
    this.collection = dbService.db().collection('xmf-upload-progress');

  }

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
