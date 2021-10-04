import { ObjectId } from 'mongodb';
import { UseInterceptors, Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, Query, Put } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentDaoService } from './dao/equipment-dao.service';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe';
import { Equipment } from './entities/equipment.entity';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { EquiomentFilterQuery as EquipmentFilterQuery } from './dto/filter-query.dto';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { Modules } from '../../login';

@Controller('equipment')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Modules('jobs')
export class EquipmentController {

  constructor(
    private readonly daoService: EquipmentDaoService,
  ) { }

  @Get('validate/:property')
  async getProperty(
    @Param('property', new ValidateObjectKeyPipe('name')) key: keyof Equipment
  ) {
    return this.daoService.validationData(key);
  }

  @Get(':id') // (^[0-9a-fA-F]{24}$)
  async getOne(
    @Param('id', ObjectIdPipe) id: ObjectId,
  ) {
    return this.daoService.getOneById(id);
  }

  @Get('')
  async getAll(
    @Query() filter: EquipmentFilterQuery,
  ) {
    return this.daoService.findAll(filter.toFilter());
  }

  @Put()
  @Modules('jobs-admin')
  async put(
    @Body() equipment: CreateEquipmentDto,
  ) {
    return this.daoService.insertOne(equipment);
  }

  @Post(':id')
  @Modules('jobs-admin')
  async post(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Body() update: UpdateEquipmentDto,
  ) {
    return this.daoService.updateOne(id, update);
  }

  @Delete(':id')
  @Modules('jobs-admin')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async delete(
    @Param('id', ObjectIdPipe) id: ObjectId,
  ) {
    return this.daoService.deleteOneById(id);
  }

}
