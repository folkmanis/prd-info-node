import { ObjectId } from 'mongodb';
import {
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { CreateProductionStageDto } from './dto/create-production-stage.dto.js';
import { UpdateProductionStageDto } from './dto/update-production-stage.dto.js';
import { ProductionStagesDaoService } from './dao/production-stages-dao.service.js';
import { Modules } from '../../login/index.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ProductionStage } from './entities/production-stage.entity.js';
import { ProductionStageQueryFilter } from './dto/production-stage-query-filter.js';
import { ObjectIdPipe } from '../../lib/object-id.pipe.js';

@Controller('production-stages')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Modules('jobs')
export class ProductionStagesController {
  constructor(private readonly daoService: ProductionStagesDaoService) { }

  @Put()
  @Modules('jobs-admin')
  async insertOne(@Body() data: CreateProductionStageDto) {
    return this.daoService.insertOne(data);
  }

  @Patch(':id')
  @Modules('jobs-admin')
  async updateOne(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Body() update: UpdateProductionStageDto,
  ) {
    return this.daoService.updateOne(id, update);
  }

  @Delete(':id')
  @Modules('jobs-admin')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteOne(@Param('id', ObjectIdPipe) id: ObjectId) {
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
  async getOne(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.daoService.getOneById(id);
  }

  @Get('')
  async getAll(@Query() filter: ProductionStageQueryFilter) {
    return this.daoService.findAll(filter.toFilter());
  }
}
