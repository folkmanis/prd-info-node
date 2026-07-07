import { Inject } from '@nestjs/common';
import { Collection, Filter, ObjectId, WithId } from 'mongodb';
import { CreateMaterial } from '../dto/create-material.dto.js';
import { MaterialQuery } from '../dto/material-filter-query.js';
import { MaterialsList } from '../dto/materials-list.dto.schema.js';
import { UpdateMaterial } from '../dto/update-material.dto.js';
import { Material } from '../entities/material.entity.js';
import { MATERIALS_COLLECTION } from './materials-collection.provider.js';

export class MaterialsDaoService {
  constructor(
    @Inject(MATERIALS_COLLECTION)
    private readonly collection: Collection<Material>,
  ) {}

  async findAll({
    start,
    limit,
    filter,
  }: MaterialQuery): Promise<MaterialsList[]> {
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

  async getOneById(id: ObjectId): Promise<WithId<Material> | null> {
    return this.collection.findOne({ _id: id });
  }

  async insertOne(material: CreateMaterial): Promise<WithId<Material> | null> {
    return this.collection.findOneAndReplace(
      { name: material.name },
      material,
      { upsert: true, returnDocument: 'after' },
    );
  }

  async updateOne(
    id: ObjectId,
    update: UpdateMaterial,
  ): Promise<WithId<Material> | null> {
    return this.collection.findOneAndUpdate({ _id: id }, update, {
      returnDocument: 'after',
    });
  }

  async deleteOne(id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    return deletedCount || 0;
  }

  async validateProperty(filter: Filter<Material>): Promise<1 | 0> {
    return this.collection.countDocuments(filter, { limit: 1 }) as Promise<
      1 | 0
    >;
  }
}
