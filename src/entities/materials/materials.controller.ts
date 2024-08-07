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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { Modules } from '../../login/index.js';
import { MaterialsDaoService } from './dao/materials-dao.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { MaterialFilterQuery } from './dto/material-filter-query.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';
import { Material } from './entities/material.entity.js';

@Controller('materials')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MaterialsController {
  constructor(private readonly materialsDao: MaterialsDaoService) { }

  @Put()
  @Modules('jobs-admin')
  async insertOne(@Body() material: CreateMaterialDto) {
    return this.materialsDao.insertOne(material);
  }

  @Patch(':id')
  @Modules('jobs-admin')
  async updateOne(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Body() material: UpdateMaterialDto,
  ) {
    return this.materialsDao.updateOne(id, material);
  }

  @Delete(':id')
  @Modules('jobs-admin')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteOne(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.materialsDao.deleteOneById(id);
  }

  @Get('validate/:property')
  async getProperty(
    @Param('property', new ValidateObjectKeyPipe('name')) key: keyof Material,
  ) {
    return this.materialsDao.validationData(key);
  }

  @Get(':id')
  async getOneById(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.materialsDao.getOneById(id);
  }

  @Get('')
  async getAll(@Query() query: MaterialFilterQuery) {
    return this.materialsDao.findAll(query.toFilter());
  }
}
