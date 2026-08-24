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
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import { Equipment } from './entities/equipment.entity.js';
import { ZodResponse } from 'nestjs-zod';
import { DeletedCountDto } from '../../lib/delete-result.dto.js';
import { ValidationResultDto } from '../../lib/validation-result.dto.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { EquipmentQueryDto } from './dto/equipment-query.dto.js';
import { EquipmentService } from './equipment.service.js';
import { EquipmentDto } from './dto/equipment.dto.js';
import { EquipmentListDto } from './dto/equipment-list.dto.js';

@Controller('equipment')
@Modules('jobs')
export class EquipmentController {
  constructor(private readonly service: EquipmentService) {}

  @ZodResponse({ type: ValidationResultDto })
  @Get('validate/:property')
  async getProperty(
    @Param('property', new ValidateObjectKeyPipe('name')) key: keyof Equipment,
    @Query('value') value: string,
  ) {
    return this.service.validationData(key, value);
  }

  @Get(':id')
  @ZodResponse({ type: EquipmentDto })
  async getOne(@Param('id') id: ObjectIdDto) {
    return this.service.getOneById(id);
  }

  @Get('')
  @ZodResponse({ type: EquipmentListDto })
  async getAll(@Query() query: EquipmentQueryDto) {
    return this.service.findAll(query);
  }

  @Put()
  @ZodResponse({ type: EquipmentDto })
  @Modules('jobs-admin')
  async put(@Body() equipment: CreateEquipmentDto) {
    return this.service.insertOne(equipment);
  }

  @Patch(':id')
  @ZodResponse({ type: EquipmentDto })
  @Modules('jobs-admin')
  async post(@Param('id') id: ObjectIdDto, @Body() update: UpdateEquipmentDto) {
    return this.service.updateOne(id, update);
  }

  @Delete(':id')
  @ZodResponse({ type: DeletedCountDto })
  @Modules('jobs-admin')
  async delete(@Param('id') id: ObjectIdDto): Promise<number> {
    return this.service.deleteOneById(id);
  }
}
