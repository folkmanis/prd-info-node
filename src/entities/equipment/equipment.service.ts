import { Injectable } from '@nestjs/common';
import { EquipmentDaoService } from './dao/equipment-dao.service.js';
import { ObjectId, WithId } from 'mongodb';
import { Equipment, EquipmentList } from './entities/equipment.entity.js';
import {
  assertCondition,
  assertNotNull,
  isFound,
} from '../../lib/assertions.js';
import { EquipmentQuery } from './dto/equipment-query.dto.js';
import { CreateEquipment } from './dto/create-equipment.dto.js';
import { UpdateEquipment } from './dto/update-equipment.dto.js';
import { ValidationResult } from '../../lib/validation-result.dto.js';

@Injectable()
export class EquipmentService {
  constructor(private dao: EquipmentDaoService) {}

  getOneById(id: ObjectId): Promise<WithId<Equipment>> {
    return isFound(this.dao.getOneById(id));
  }

  findAll({
    start,
    limit,
    filter,
  }: EquipmentQuery): Promise<WithId<EquipmentList>[]> {
    return this.dao.findAll(filter, start, limit);
  }

  insertOne(equipment: CreateEquipment): Promise<WithId<Equipment>> {
    return isFound(this.dao.insertOne(equipment));
  }

  updateOne(
    id: ObjectId,
    equipment: UpdateEquipment,
  ): Promise<WithId<Equipment>> {
    return isFound(this.dao.updateOne(id, equipment));
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    return this.dao.deleteOneById(id);
  }

  async validationData<K extends keyof Equipment>(
    key: K,
    value: Equipment[K],
  ): Promise<ValidationResult> {
    const pattern = `^${value}$`;
    const result = await this.dao.validateProperty({
      [key]: new RegExp(pattern, 'i'),
    });
    return { valid: result === 0, property: key, value };
  }
}
