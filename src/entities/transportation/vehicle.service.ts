import { Injectable } from '@nestjs/common';
import { Filter, ObjectId, WithId } from 'mongodb';
import { isFound } from '../../lib/assertions.js';
import { ValidationResult } from '../../lib/validation-result.dto.js';
import { TransportationVehicleDaoService } from './dao/vehicle-dao.service.js';
import { CreateVehicle } from './dto/create-vehicle.dto.js';
import { UpdateVehicle } from './dto/update-vehicle.dto.js';
import {
  TransportationVehicle,
  TransportationVehicleList,
} from './entities/vehicle.entity.js';

@Injectable()
export class VehicleService {
  constructor(private vehicleDao: TransportationVehicleDaoService) {}

  async findAll(
    filter: Filter<TransportationVehicle>,
    start?: number,
    limit?: number,
  ): Promise<WithId<TransportationVehicleList>[]> {
    return this.vehicleDao.findAll(filter, start, limit);
  }

  async findOne(id: ObjectId): Promise<WithId<TransportationVehicle>> {
    return isFound(this.vehicleDao.getOneById(id));
  }

  async insertOne(
    vehicle: CreateVehicle,
  ): Promise<WithId<TransportationVehicle>> {
    return isFound(this.vehicleDao.insertOne(vehicle));
  }

  async updateOne(
    id: ObjectId,
    vehicle: UpdateVehicle,
  ): Promise<WithId<TransportationVehicle>> {
    return isFound(this.vehicleDao.updateOne(id, vehicle));
  }

  async deleteOne(id: ObjectId): Promise<number> {
    return this.vehicleDao.deleteOneById(id);
  }

  async validateProperty<K extends keyof TransportationVehicle>(
    key: K,
    value: TransportationVehicle[K],
  ): Promise<ValidationResult> {
    const result = await this.vehicleDao.validateProperty({ [key]: value });
    return { valid: result === 0, property: key, value };
  }
}
