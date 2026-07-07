import { Injectable, NotFoundException } from '@nestjs/common';
import { MaterialsDaoService } from './dao/materials-dao.service.js';
import { CreateMaterial } from './dto/create-material.dto.js';
import { ObjectId, WithId } from 'mongodb';
import { Material } from './entities/material.entity.js';
import { isFound } from '../../lib/assertions.js';
import { UpdateMaterial } from './dto/update-material.dto.js';
import { ValidationResult } from '../../lib/validation-result.dto.js';
import { MaterialsList } from './dto/materials-list.dto.schema.js';
import { MaterialQuery } from './dto/material-filter-query.js';

@Injectable()
export class MaterialsService {
  constructor(private materialsDao: MaterialsDaoService) {}

  async getOne(id: ObjectId): Promise<WithId<Material>> {
    return isFound(this.materialsDao.getOneById(id));
  }

  async findAll(query: MaterialQuery): Promise<MaterialsList[]> {
    return this.materialsDao.findAll(query);
  }

  async insertOne(create: CreateMaterial): Promise<WithId<Material>> {
    return isFound(this.materialsDao.insertOne(create));
  }

  async updateOne(
    id: ObjectId,
    update: UpdateMaterial,
  ): Promise<WithId<Material>> {
    return isFound(this.materialsDao.updateOne(id, update));
  }

  async deleteOne(id: ObjectId): Promise<number> {
    const deletedCount = await this.materialsDao.deleteOne(id);
    if (deletedCount === 0) {
      throw new NotFoundException(`Material ${id} not found`);
    }
    return deletedCount;
  }

  async validateProperty<K extends keyof Material>(
    key: K,
    value: Material[K],
  ): Promise<ValidationResult> {
    const pattern = `^${value}$`;
    const result = await this.materialsDao.validateProperty({
      [key]: new RegExp(pattern, 'i'),
    });
    return { valid: result === 0, property: key, value };
  }
}
