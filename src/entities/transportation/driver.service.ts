import { Injectable } from '@nestjs/common';
import { TransportationDriverDaoService } from './dao/driver-dao.service.js';
import { TransportationDriver } from './entities/driver.entity.js';
import { DriverFilterQuery } from './dto/driver-filter.query.js';
import { ObjectId } from 'mongodb';
import { CreateDriverDto } from './dto/create-driver.dto.js';
import { UpdateDriverDto } from './dto/update-driver.dto.js';

@Injectable()
export class DriverService {
  constructor(private driverDao: TransportationDriverDaoService) {}

  async findAll(query: DriverFilterQuery): Promise<TransportationDriver[]> {
    return this.driverDao.findAll(query.toFilter());
  }

  async findOne(id: ObjectId): Promise<TransportationDriver | null> {
    return this.driverDao.getOneById(id);
  }

  async insertOne(
    driver: CreateDriverDto,
  ): Promise<TransportationDriver | null> {
    return this.driverDao.insertOne(driver);
  }

  async updateOne(
    id: ObjectId,
    driver: UpdateDriverDto,
  ): Promise<TransportationDriver | null> {
    return this.driverDao.updateOne(id, driver);
  }

  async deleteOne(id: ObjectId): Promise<number> {
    return this.driverDao.deleteOneById(id);
  }

  async validate<K extends keyof TransportationDriver>(
    key: K,
  ): Promise<TransportationDriver[K][]> {
    return this.driverDao.validationData(key);
  }
}
