import { Inject, Injectable } from '@nestjs/common';
import { Collection, Filter, ObjectId, WithId } from 'mongodb';
import { CreateVehicle } from '../dto/create-vehicle.dto.js';
import { UpdateVehicle } from '../dto/update-vehicle.dto.js';
import { VehicleQuery } from '../dto/vehicle-filter.query.js';
import {
  TransportationVehicle,
  TransportationVehicleList,
} from '../entities/vehicle.entity.js';
import { TRANSPORTATION_VEHICLE_COLLECTION } from './vehicle-provider.js';

@Injectable()
export class TransportationVehicleDaoService {
  constructor(
    @Inject(TRANSPORTATION_VEHICLE_COLLECTION)
    private collection: Collection<TransportationVehicle>,
  ) {}

  findAll(
    filter: Filter<TransportationVehicle>,
    start?: number,
    limit?: number,
  ): Promise<WithId<TransportationVehicleList>[]> {
    return this.collection
      .find(filter, {
        sort: {
          name: 1,
        },
        skip: start,
        limit: limit,
        projection: {
          name: 1,
          disabled: 1,
          licencePlate: 1,
          fuelType: 1,
          consumption: 1,
        },
      })
      .toArray();
  }

  getOneById(id: ObjectId): Promise<WithId<TransportationVehicle> | null> {
    return this.collection.findOne({ _id: id });
  }

  insertOne(
    vehicle: CreateVehicle,
  ): Promise<WithId<TransportationVehicle> | null> {
    return this.collection.findOneAndReplace({ name: vehicle.name }, vehicle, {
      returnDocument: 'after',
      upsert: true,
    });
  }

  updateOne(
    id: ObjectId,
    updateOperations: UpdateVehicle,
  ): Promise<WithId<TransportationVehicle> | null> {
    return this.collection.findOneAndUpdate({ _id: id }, updateOperations, {
      returnDocument: 'after',
    });
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    return deletedCount;
  }

  validateProperty(filter: Filter<TransportationVehicle>): Promise<0 | 1> {
    return this.collection.countDocuments(filter, { limit: 1 }) as Promise<
      0 | 1
    >;
  }
}
