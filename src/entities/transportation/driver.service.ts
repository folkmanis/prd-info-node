import { Injectable } from '@nestjs/common';
import { Filter, ObjectId, WithId } from 'mongodb';
import { isFound } from '../../lib/assertions.js';
import { ValidationResult } from '../../lib/validation-result.dto.js';
import { TransportationDriverDaoService } from './dao/driver-dao.service.js';
import { CreateDriver } from './dto/create-driver.dto.js';
import { UpdateDriver } from './dto/update-driver.dto.js';
import {
  TransportationDriver,
  TransportationDriverList,
} from './entities/driver.entity.js';

@Injectable()
export class DriverService {
  constructor(private driverDao: TransportationDriverDaoService) {}

  findAll(
    filter: Filter<TransportationDriver>,
    start?: number,
    limit?: number,
  ): Promise<WithId<TransportationDriverList>[]> {
    return this.driverDao.findAll(filter, start, limit);
  }

  findOne(id: ObjectId): Promise<WithId<TransportationDriver>> {
    return isFound(this.driverDao.getOneById(id));
  }

  insertOne(driver: CreateDriver): Promise<WithId<TransportationDriver>> {
    return isFound(this.driverDao.insertOne(driver));
  }

  updateOne(
    id: ObjectId,
    driver: UpdateDriver,
  ): Promise<WithId<TransportationDriver>> {
    return isFound(this.driverDao.updateOne(id, driver));
  }

  deleteOne(id: ObjectId): Promise<number> {
    return this.driverDao.deleteOneById(id);
  }

  async validate<K extends keyof TransportationDriver>(
    key: K,
    value: TransportationDriver[K],
  ): Promise<ValidationResult> {
    const result = await this.driverDao.validateProperty({ [key]: value });
    return { valid: result === 0, property: key, value };
  }
}
