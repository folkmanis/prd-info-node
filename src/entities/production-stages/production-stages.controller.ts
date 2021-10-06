import { ObjectId } from 'mongodb';
import { UsePipes, ValidationPipe, UseInterceptors, Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { CreateProductionStageDto } from './dto/create-production-stage.dto';
import { UpdateProductionStageDto } from './dto/update-production-stage.dto';
import { ProductionStagesDaoService } from './dao/production-stages-dao.service';
import { Modules } from '../../login';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe';
import { ProductionStage } from './entities/production-stage.entity';
import { ProductionStageQueryFilter } from './dto/production-stage-query-filter';
import { ObjectIdPipe } from '../../lib/object-id.pipe';

@Controller('production-stages')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Modules('jobs')
export class ProductionStagesController {
  constructor(
    private readonly daoService: ProductionStagesDaoService,
  ) { }

  @Put()
  @Modules('jobs-admin')
  async insertOne(
    @Body() data: CreateProductionStageDto
  ) {
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
  async deleteOne(
    @Param('id', ObjectIdPipe) id: ObjectId
  ) {
    return this.daoService.deleteOneById(id);
  }

  @Get('validate/:property')
  async getProperty(
    @Param('property', new ValidateObjectKeyPipe('name')) key: keyof ProductionStage
  ) {
    return this.daoService.validationData(key);
  }

  @Get(':id')
  async getOne(
    @Param('id', ObjectIdPipe) id: ObjectId
  ) {
    return this.daoService.getOneById(id);
  }

  @Get('')
  async getAll(
    @Query() filter: ProductionStageQueryFilter,
  ) {
    return this.daoService.findAll(filter.toFilter());
  }


}
