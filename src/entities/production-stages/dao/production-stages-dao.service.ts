import { Inject, Injectable } from '@nestjs/common';
import { ObjectId, Collection } from 'mongodb';
import { EntityDao } from '../../entityDao.interface';
import { ProductionStage } from '../entities/production-stage.entity';
import { CreateProductionStageDto } from '../dto/create-production-stage.dto';
import { UpdateProductionStageDto } from '../dto/update-production-stage.dto';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { PRODUCTION_STAGES_COLLECTION } from './production-stages.provider';
import { flatten } from 'flat';


@Injectable()
export class ProductionStagesDaoService implements EntityDao<ProductionStage> {
  constructor(
    @Inject(PRODUCTION_STAGES_COLLECTION)
    private readonly collection: Collection<ProductionStage>,
  ) { }

  async findAll({
    limit,
    start,
    filter,
  }: FilterType<ProductionStage>): Promise<Partial<ProductionStage>[]> {
    return this.collection
      .find(filter, {
        projection: {
          _id: 1,
          name: 1,
          equipmentIds: 1,
        },
        sort: {
          name: 1,
        },
        skip: start,
        limit,
      })
      .toArray();
  }

  async getOneById(id: ObjectId): Promise<ProductionStage | null> {
    return this.collection.findOne({ _id: id });
  }

  async insertOne(
    productionStage: CreateProductionStageDto,
  ): Promise<ProductionStage | null> {
    const { value } = await this.collection.findOneAndReplace(
      { name: productionStage.name },
      productionStage,
      { upsert: true, returnDocument: 'after' },
    );
    return value;
  }

  async updateOne(
    id: ObjectId,
    update: UpdateProductionStageDto,
  ): Promise<ProductionStage | null> {
    const { value } = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: flatten(update, { safe: true }) },
      { returnDocument: 'after' },
    );
    return value;
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    return deletedCount || 0;
  }

  async validationData<K extends keyof ProductionStage>(
    key: K,
  ): Promise<ProductionStage[K][]> {
    return this.collection
      .find()
      .project({ _id: 0, [key]: 1 })
      .map((data) => data[key])
      .toArray();
  }
}
