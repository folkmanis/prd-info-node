import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { WithId } from 'mongodb';
import { ZodResponse } from 'nestjs-zod';
import { DeletedCountDto } from '../../lib/delete-result.dto.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ValidationResultDto } from '../../lib/validation-result.dto.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { CreateProductionStageDto } from './dto/create-production-stage.dto.js';
import { ProductionStageListDto } from './dto/production-stage-list.dto.js';
import { ProductionStageQueryDto } from './dto/production-stage-query-filter.js';
import { ProductionStageDto } from './dto/production-stage.dto.js';
import { UpdateProductionStageDto } from './dto/update-production-stage.dto.js';
import {
  ProductionStage,
  ProductionStageList,
} from './entities/production-stage.entity.js';
import { ProductionStagesService } from './production-stages.service.js';

@Controller('production-stages')
@Modules('jobs')
export class ProductionStagesController {
  constructor(private readonly service: ProductionStagesService) {}

  @Put()
  @Modules('jobs-admin')
  @ZodResponse({ type: ProductionStageDto })
  async insertOne(
    @Body() data: CreateProductionStageDto,
  ): Promise<WithId<ProductionStage>> {
    return this.service.insertOne(data);
  }

  @Patch(':id')
  @Modules('jobs-admin')
  @ZodResponse({ type: ProductionStageDto })
  async updateOne(
    @Param('id') id: ObjectIdDto,
    @Body()
    update: UpdateProductionStageDto,
  ): Promise<WithId<ProductionStage>> {
    return this.service.updateOne(id, update);
  }

  @Delete(':id')
  @Modules('jobs-admin')
  @ZodResponse({ type: DeletedCountDto })
  async deleteOne(@Param('id') id: ObjectIdDto): Promise<number> {
    return this.service.deleteOne(id);
  }

  @Get('validate/:property')
  @ZodResponse({ type: ValidationResultDto })
  async getProperty(
    @Param('property', new ValidateObjectKeyPipe('name'))
    key: keyof ProductionStage,
    @Query('value') value: string,
  ) {
    return this.service.validateProperty(key, value);
  }

  @Get(':id')
  @ZodResponse({ type: ProductionStageDto })
  async getOne(@Param('id') id: ObjectIdDto): Promise<WithId<ProductionStage>> {
    return this.service.getOneById(id);
  }

  @Get('')
  @ZodResponse({ type: ProductionStageListDto })
  async getAll(
    @Query()
    query: ProductionStageQueryDto,
  ): Promise<WithId<ProductionStageList>[]> {
    return this.service.getAll(query);
  }
}
