import { Inject, Injectable } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { TransportationVehicle } from '../entities/vehicle.entity.js';
import { TRANSPORTATION_VEHICLE_COLLECTION } from './vehicle-provider.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto.js';
import { flatten } from 'flat';
import { EntityDao } from '../../entityDao.interface.js';
import { CreateVehicleDto } from '../dto/create-vehicle.dto.js';

@Injectable()
export class TransportationVehicleDaoService
  implements EntityDao<TransportationVehicle>
{
  constructor(
    @Inject(TRANSPORTATION_VEHICLE_COLLECTION)
    private collection: Collection<TransportationVehicle>,
  ) {}

  async findAll({
    start,
    limit,
    filter,
  }: FilterType<TransportationVehicle>): Promise<TransportationVehicle[]> {
    return this.collection
      .find(filter, {
        sort: {
          name: 1,
        },
        skip: start,
        limit: limit,
      })
      .toArray();
  }

  async getOneById(id: ObjectId): Promise<TransportationVehicle | null> {
    return this.collection.findOne({ _id: id });
  }

  async insertOne(
    vehicle: CreateVehicleDto,
  ): Promise<TransportationVehicle | null> {
    return this.collection.findOneAndReplace({ name: vehicle.name }, vehicle, {
      returnDocument: 'after',
      upsert: true,
    });
  }

  async updateOne(
    id: ObjectId,
    vehicle: UpdateVehicleDto,
  ): Promise<TransportationVehicle | null> {
    return this.collection.findOneAndUpdate(
      { _id: id },
      { $set: flatten(vehicle, { safe: true }) },
      { returnDocument: 'after' },
    );
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    return deletedCount || 0;
  }

  async validationData<K extends keyof TransportationVehicle>(
    key: K,
  ): Promise<TransportationVehicle[K][]> {
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
