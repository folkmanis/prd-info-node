import { Inject, Injectable } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { TransportationDriver } from '../entities/driver.entity.js';
import { TRANSPORTATION_DRIVER_COLLECTION } from './driver-provider.js';
import { EntityDao } from '../../entityDao.interface.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { CreateDriverDto } from '../dto/create-driver.dto.js';
import { UpdateDriverDto } from '../dto/update-driver.dto.js';
import { flatten } from 'flat';

@Injectable()
export class TransportationDriverDaoService
  implements EntityDao<TransportationDriver>
{
  constructor(
    @Inject(TRANSPORTATION_DRIVER_COLLECTION)
    private collection: Collection<TransportationDriver>,
  ) {}

  async findAll({
    start,
    limit,
    filter,
  }: FilterType<TransportationDriver>): Promise<TransportationDriver[]> {
    return this.collection
      .find(filter, {
        sort: { name: 1 },
        skip: start,
        limit: limit,
      })
      .toArray();
  }

  async getOneById(id: ObjectId): Promise<TransportationDriver | null> {
    return this.collection.findOne({ _id: id });
  }

  async insertOne(
    driver: CreateDriverDto,
  ): Promise<TransportationDriver | null> {
    return this.collection.findOneAndReplace({ name: driver.name }, driver, {
      returnDocument: 'after',
      upsert: true,
    });
  }

  async updateOne(
    id: ObjectId,
    driver: UpdateDriverDto,
  ): Promise<TransportationDriver | null> {
    return this.collection.findOneAndUpdate(
      { _id: id },
      { $set: flatten(driver, { safe: true }) },
      { returnDocument: 'after' },
    );
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    return deletedCount || 0;
  }

  validationData<K extends keyof TransportationDriver>(
    key: K,
  ): Promise<Array<TransportationDriver[K]>> {
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
      .map((value) => value[key])
      .toArray();
  }
}
