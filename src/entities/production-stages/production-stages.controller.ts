import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { ProductionStagesDaoService } from './dao/production-stages-dao.service.js';
import { CreateProductionStageDto } from './dto/create-production-stage.dto.js';
import { ProductionStageQueryFilter } from './dto/production-stage-query-filter.js';
import { UpdateProductionStageDto } from './dto/update-production-stage.dto.js';
import { ProductionStage } from './entities/production-stage.entity.js';

@Controller('production-stages')
@Modules('jobs')
export class ProductionStagesController {
  constructor(private readonly daoService: ProductionStagesDaoService) {}

  @Put()
  @Modules('jobs-admin')
  async insertOne(
    @Body(new ValidationPipe({ transform: true }))
    data: CreateProductionStageDto,
  ) {
    return this.daoService.insertOne(data);
  }

  @Patch(':id')
  @Modules('jobs-admin')
  async updateOne(
    @Param('id') id: ObjectIdDto,
    @Body(new ValidationPipe({ transform: true }))
    update: UpdateProductionStageDto,
  ) {
    return this.daoService.updateOne(id, update);
  }

  @Delete(':id')
  @Modules('jobs-admin')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteOne(@Param('id') id: ObjectIdDto) {
    return this.daoService.deleteOneById(id);
  }

  @Get('validate/:property')
  async getProperty(
    @Param('property', new ValidateObjectKeyPipe('name'))
    key: keyof ProductionStage,
  ) {
    return this.daoService.validationData(key);
  }

  @Get(':id')
  async getOne(@Param('id') id: ObjectIdDto) {
    return this.daoService.getOneById(id);
  }

  @Get('')
  async getAll(
    @Query(new ValidationPipe({ transform: true }))
    filter: ProductionStageQueryFilter,
  ) {
    return this.daoService.findAll(filter.toFilter());
  }
}
