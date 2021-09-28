import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../../database';
import { StartAndLimit } from '../../../lib/query-start-limit.pipe';
import { XmfUploadProgress } from '../entities/xmf-upload-progress.entity';

@Injectable()
export class XmfUploadProgressDao {

    private collection: Collection<XmfUploadProgress> = this.dbService.db().collection('xmf-upload-progress');

    constructor(
        private readonly dbService: DatabaseService,
    ) { }

    async insertOne(upload: XmfUploadProgress) {
        const { insertedId } = await this.collection.insertOne(upload);
        return insertedId;
    }

    async findAll({ start, limit }: StartAndLimit): Promise<XmfUploadProgress[]> {
        return this.collection.find(
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
