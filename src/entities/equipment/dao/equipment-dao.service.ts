import { Injectable } from '@nestjs/common';
import { classToPlain, instanceToPlain } from 'class-transformer';
import { Collection, ObjectId, WithoutId } from 'mongodb';
import { DatabaseService } from '../../../database/index.js';
import { EntityDao } from '../../entityDao.interface.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { CreateEquipmentDto } from '../dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto.js';
import { Equipment } from '../entities/equipment.entity.js';

const EQUIPMENT_COLLECTION_NAME = 'equipment';

@Injectable()
export class EquipmentDaoService implements EntityDao<Equipment> {
  private readonly collection: Collection<Equipment>;

  constructor(private readonly dbService: DatabaseService) {
    this.collection = this.dbService
      .db()
      .collection(EQUIPMENT_COLLECTION_NAME);

    this.createIndexes();
  }

  async findAll({
    start,
    limit,
    filter,
  }: FilterType<Equipment>): Promise<Partial<Equipment>[]> {
    return this.collection
      .find(filter, {
        sort: { name: 1 },
        limit,
        skip: start,
      })
      .toArray();
  }

  async insertOne(equipment: CreateEquipmentDto): Promise<Equipment | null> {
    return this.collection.findOneAndReplace(
      { name: equipment.name },
      instanceToPlain(equipment) as WithoutId<Equipment>,
      { upsert: true, returnDocument: 'after' },
    );
  }

  async getOneById(_id: ObjectId): Promise<Equipment | null> {
    return this.collection.findOne({ _id });
  }

  async updateOne(
    _id: ObjectId,
    update: UpdateEquipmentDto,
  ): Promise<Equipment | null> {
    return this.collection.findOneAndUpdate(
      { _id },
      { $set: classToPlain(update) },
      { returnDocument: 'after' },
    );
  }

  async deleteOneById(_id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id });
    return deletedCount || 0;
  }

  async validationData<K extends keyof Equipment>(
    key: K,
  ): Promise<Array<Equipment[K]>> {
    const result = await this.collection
      .find(
        {},
        {
          projection: {
            [key]: 1,
            _id: 0,
          },
        },
      )
      .toArray();
    return result.map((obj) => obj[key]);
  }

  private createIndexes(): void {
    try {
      this.collection.createIndexes([
        {
          key: { name: 1 },
          unique: true,
        },
      ]);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}
