import { Injectable } from '@nestjs/common';
import { ProductionStagesDaoService } from './dao/production-stages-dao.service.js';
import { ObjectId, WithId } from 'mongodb';
import {
  ProductionStage,
  ProductionStageList,
} from './entities/production-stage.entity.js';
import { CreateProductionStage } from './dto/create-production-stage.dto.js';
import { isFound } from '../../lib/assertions.js';
import { UpdateProductionStage } from './dto/update-production-stage.dto.js';
import { ValidationResult } from '../../lib/validation-result.dto.js';
import { ProductionStageQuery } from './dto/production-stage-query-filter.js';

@Injectable()
export class ProductionStagesService {
  constructor(private dao: ProductionStagesDaoService) {}

  getAll(query: ProductionStageQuery): Promise<WithId<ProductionStageList>[]> {
    return this.dao.findAll(query);
  }

  getOneById(id: ObjectId): Promise<WithId<ProductionStage>> {
    return isFound(this.dao.getOneById(id));
  }

  insertOne(data: CreateProductionStage): Promise<WithId<ProductionStage>> {
    return isFound(this.dao.insertOne(data));
  }

  updateOne(
    id: ObjectId,
    data: UpdateProductionStage,
  ): Promise<WithId<ProductionStage>> {
    return isFound(this.dao.updateOne(id, data));
  }

  async deleteOne(id: ObjectId): Promise<number> {
    return this.dao.deleteOneById(id);
  }

  async validateProperty<K extends keyof ProductionStage>(
    key: K,
    value: ProductionStage[K],
  ): Promise<ValidationResult> {
    const pattern = `^${value}$`;
    const result = await this.dao.validateProperty({
      [key]: new RegExp(pattern, 'i'),
    });
    return { valid: result === 0, property: key, value };
  }
}
