import { Inject, Injectable } from '@nestjs/common';
import { Collection, Filter, ObjectId, WithId } from 'mongodb';
import { CreateDriver } from '../dto/create-driver.dto.js';
import { UpdateDriver } from '../dto/update-driver.dto.js';
import {
  TransportationDriver,
  TransportationDriverList,
} from '../entities/driver.entity.js';
import { TRANSPORTATION_DRIVER_COLLECTION } from './driver-provider.js';

@Injectable()
export class TransportationDriverDaoService {
  constructor(
    @Inject(TRANSPORTATION_DRIVER_COLLECTION)
    private collection: Collection<TransportationDriver>,
  ) {}

  async findAll(
    filter: Filter<TransportationDriver>,
    start = 0,
    limit?: number,
  ): Promise<WithId<TransportationDriverList>[]> {
    return this.collection
      .find(filter, {
        sort: { name: 1 },
        skip: start,
        limit: limit,
        projection: {
          name: 1,
          disabled: 1,
        },
      })
      .toArray();
  }

  async getOneById(id: ObjectId): Promise<WithId<TransportationDriver> | null> {
    return this.collection.findOne({ _id: id });
  }

  async insertOne(
    driver: CreateDriver,
  ): Promise<WithId<TransportationDriver> | null> {
    return this.collection.findOneAndReplace({ name: driver.name }, driver, {
      returnDocument: 'after',
      upsert: true,
    });
  }

  async updateOne(
    id: ObjectId,
    updateOperations: UpdateDriver,
  ): Promise<WithId<TransportationDriver> | null> {
    return this.collection.findOneAndUpdate({ _id: id }, updateOperations, {
      returnDocument: 'after',
    });
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    return deletedCount;
  }

  validateProperty(filter: Filter<TransportationDriver>): Promise<1 | 0> {
    return this.collection.countDocuments(filter, { limit: 1 }) as Promise<
      1 | 0
    >;
  }
}
