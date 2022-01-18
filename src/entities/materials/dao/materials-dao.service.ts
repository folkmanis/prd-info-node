import { EntityDao } from '../../entityDao.interface';
import { Material } from '../entities/material.entity';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { MATERIALS_COLLECTION } from './materials-collection.provider';
import { Collection, ObjectId } from 'mongodb';
import { Inject } from '@nestjs/common';

export class MaterialsDaoService implements EntityDao<Material> {
  constructor(
    @Inject(MATERIALS_COLLECTION)
    private readonly collection: Collection<Material>,
  ) {}

  async findAll({
    start,
    limit,
    filter,
  }: FilterType<Material>): Promise<Partial<Material>[]> {
    return this.collection
      .find(filter, {
        projection: {
          name: 1,
          description: 1,
          category: 1,
          inactive: 1,
        },
        sort: {
          category: 1,
          name: 1,
        },
        skip: start,
        limit: limit,
      })
      .toArray();
  }

  async getOneById(id: ObjectId): Promise<Material | null> {
    return this.collection.findOne({ _id: id });
  }

  async insertOne(material: CreateMaterialDto): Promise<Material | null> {
    const { value } = await this.collection.findOneAndReplace(
      { name: material.name },
      material,
      { upsert: true, returnDocument: 'after' },
    );
    return value;
  }

  async updateOne(
    id: ObjectId,
    material: UpdateMaterialDto,
  ): Promise<Material | null> {
    const { value } = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: material },
      { returnDocument: 'after' },
    );
    return value;
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    return deletedCount || 0;
  }

  async validationData<K extends keyof Material>(
    key: K,
  ): Promise<Material[K][]> {
    return this.collection
      .find(
        {},
        {
          projection: {
            [key]: 1,
            _id: 0,
          },
        },
      )
      .map((val) => val[key])
      .toArray();
  }
}
