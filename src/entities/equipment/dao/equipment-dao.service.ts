import { Injectable } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { Collection, ObjectId, WithoutId } from 'mongodb';
import { DatabaseService } from '../../../database';
import { EntityDao } from '../../entityDao.interface';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { Equipment } from '../entities/equipment.entity';

const EQUIPMENT_COLLECTION_NAME = 'equipment';

@Injectable()
export class EquipmentDaoService implements EntityDao<Equipment> {
  private readonly collection: Collection<Equipment> = this.dbService
    .db()
    .collection(EQUIPMENT_COLLECTION_NAME);

  constructor(private readonly dbService: DatabaseService) {
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
    const { value } = await this.collection.findOneAndReplace(
      { name: equipment.name },
      classToPlain(equipment) as WithoutId<Equipment>,
      { upsert: true, returnDocument: 'after' },
    );
    return value;
  }

  async getOneById(_id: ObjectId): Promise<Equipment | null> {
    return this.collection.findOne({ _id });
  }

  async updateOne(
    _id: ObjectId,
    update: UpdateEquipmentDto,
  ): Promise<Equipment | null> {
    const { value } = await this.collection.findOneAndUpdate(
      { _id },
      { $set: classToPlain(update) },
      { returnDocument: 'after' },
    );
    return value;
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
