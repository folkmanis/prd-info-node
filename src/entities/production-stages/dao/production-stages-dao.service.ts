import { Inject, Injectable } from '@nestjs/common';
import { Collection, Filter, ObjectId, WithId } from 'mongodb';
import { CreateProductionStage } from '../dto/create-production-stage.dto.js';
import { ProductionStageQuery } from '../dto/production-stage-query-filter.js';
import { UpdateProductionStage } from '../dto/update-production-stage.dto.js';
import {
  ProductionStage,
  ProductionStageList,
} from '../entities/production-stage.entity.js';
import { PRODUCTION_STAGES_COLLECTION } from './production-stages.provider.js';

@Injectable()
export class ProductionStagesDaoService {
  constructor(
    @Inject(PRODUCTION_STAGES_COLLECTION)
    private readonly collection: Collection<ProductionStage>,
  ) {}

  async findAll({
    limit,
    start,
    filter,
  }: ProductionStageQuery): Promise<WithId<ProductionStageList>[]> {
    return this.collection
      .find(filter, {
        projection: {
          name: 1,
          equipmentIds: 1,
          disabled: 1,
        },
        sort: {
          name: 1,
        },
        skip: start,
        limit,
      })
      .toArray();
  }

  async getOneById(_id: ObjectId): Promise<WithId<ProductionStage> | null> {
    return this.collection.findOne({ _id });
  }

  async insertOne(
    data: CreateProductionStage,
  ): Promise<WithId<ProductionStage> | null> {
    return this.collection.findOneAndReplace({ name: data.name }, data, {
      upsert: true,
      returnDocument: 'after',
    });
  }

  async updateOne(
    _id: ObjectId,
    operations: UpdateProductionStage,
  ): Promise<WithId<ProductionStage> | null> {
    return this.collection.findOneAndUpdate({ _id }, operations, {
      returnDocument: 'after',
    });
  }

  async deleteOneById(_id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id });
    return deletedCount;
  }

  async validateProperty(filter: Filter<ProductionStage>): Promise<0 | 1> {
    return this.collection.countDocuments(filter, { limit: 1 }) as Promise<
      0 | 1
    >;
  }
}
