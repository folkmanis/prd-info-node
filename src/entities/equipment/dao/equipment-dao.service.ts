import { Inject, Injectable } from '@nestjs/common';
import { Collection, Filter, ObjectId, WithId } from 'mongodb';
import { CreateEquipment } from '../dto/create-equipment.dto.js';
import { UpdateEquipment } from '../dto/update-equipment.dto.js';
import { Equipment, EquipmentList } from '../entities/equipment.entity.js';
import { EQUIPMENT_COLLECTION } from './equipment-provider.js';

@Injectable()
export class EquipmentDaoService {
  constructor(
    @Inject(EQUIPMENT_COLLECTION)
    private readonly collection: Collection<Equipment>,
  ) {}

  async findAll(
    filter: Filter<Equipment>,
    start?: number,
    limit?: number,
  ): Promise<WithId<EquipmentList>[]> {
    return this.collection
      .find(filter, {
        sort: { name: 1 },
        projection: { description: 0 },
        limit,
        skip: start,
      })
      .toArray();
  }

  async insertOne(
    equipment: CreateEquipment,
  ): Promise<WithId<Equipment> | null> {
    return this.collection.findOneAndReplace(
      { name: equipment.name },
      equipment,
      { returnDocument: 'after', upsert: true },
    );
  }

  async getOneById(_id: ObjectId): Promise<WithId<Equipment> | null> {
    return this.collection.findOne({ _id });
  }

  async updateOne(
    _id: ObjectId,
    update: UpdateEquipment,
  ): Promise<WithId<Equipment> | null> {
    return this.collection.findOneAndUpdate({ _id }, update, {
      returnDocument: 'after',
      upsert: false,
    });
  }

  async deleteOneById(_id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id });
    return deletedCount;
  }

  async validateProperty(filter: Filter<Equipment>): Promise<0 | 1> {
    return this.collection.countDocuments(filter, { limit: 1 }) as Promise<
      0 | 1
    >;
  }
}
