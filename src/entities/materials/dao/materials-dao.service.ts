import { EntityDao } from '../../entityDao.interface.js';
import { Material } from '../entities/material.entity.js';
import { CreateMaterialDto } from '../dto/create-material.dto.js';
import { UpdateMaterialDto } from '../dto/update-material.dto.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { MATERIALS_COLLECTION } from './materials-collection.provider.js';
import { Collection, ObjectId } from 'mongodb';
import { Inject } from '@nestjs/common';
import { flatten } from 'flat';

export class MaterialsDaoService implements EntityDao<Material> {
  constructor(
    @Inject(MATERIALS_COLLECTION)
    private readonly collection: Collection<Material>,
  ) { }

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
          units: 1,
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
    return this.collection.findOneAndReplace(
      { name: material.name },
      material,
      { upsert: true, returnDocument: 'after' },
    );
  }

  async updateOne(
    id: ObjectId,
    material: UpdateMaterialDto,
  ): Promise<Material | null> {
    return this.collection.findOneAndUpdate(
      { _id: id },
      { $set: flatten(material, { safe: true }) },
      { returnDocument: 'after' },
    );
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
