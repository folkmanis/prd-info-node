import { Injectable } from '@nestjs/common';
import { TransportationVehicleDaoService } from './dao/vehicle-dao.service.js';
import { TransportationVehicle } from './entities/vehicle.entity.js';
import { VehicleFilterQuery } from './dto/vehicle-filter.query.js';
import { ObjectId } from 'mongodb';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';

@Injectable()
export class VehicleService {
  constructor(private vehicleDao: TransportationVehicleDaoService) {}

  async findAll(query: VehicleFilterQuery): Promise<TransportationVehicle[]> {
    return this.vehicleDao.findAll(query.toFilter());
  }

  async findOne(id: ObjectId): Promise<TransportationVehicle | null> {
    return this.vehicleDao.getOneById(id);
  }

  async insertOne(
    vehicle: CreateVehicleDto,
  ): Promise<TransportationVehicle | null> {
    return this.vehicleDao.insertOne(vehicle);
  }

  async updateOne(
    id: ObjectId,
    vehicle: UpdateVehicleDto,
  ): Promise<TransportationVehicle | null> {
    return this.vehicleDao.updateOne(id, vehicle);
  }

  async deleteOne(id: ObjectId): Promise<number> {
    return this.vehicleDao.deleteOneById(id);
  }

  async validate<K extends keyof TransportationVehicle>(
    key: K,
  ): Promise<TransportationVehicle[K][]> {
    return this.vehicleDao.validationData(key);
  }
}
