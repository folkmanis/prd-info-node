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

import { createZodDto, ZodResponse } from 'nestjs-zod';
import { z } from 'zod';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ValidationResultDto } from '../../lib/validation-result.dto.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { MaterialQueryDto } from './dto/material-filter-query.js';
import { MaterialDto } from './dto/material.dto.schema.js';
import { MaterialsListDto } from './dto/materials-list.dto.schema.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';
import { Material } from './entities/material.entity.js';
import { MaterialsService } from './materials.service.js';

@Controller('materials')
@Modules('jobs')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @ZodResponse({ type: MaterialDto })
  @Put()
  @Modules('jobs-admin')
  async insertOne(@Body() material: CreateMaterialDto) {
    return this.materialsService.insertOne(material);
  }

  @ZodResponse({ type: MaterialDto })
  @Patch(':id')
  @Modules('jobs-admin')
  async updateOne(
    @Param('id') id: ObjectIdDto,
    @Body() material: UpdateMaterialDto,
  ) {
    return this.materialsService.updateOne(id, material);
  }

  @ZodResponse({ type: createZodDto(z.number()) })
  @Delete(':id')
  @Modules('jobs-admin')
  async deleteOne(@Param('id') id: ObjectIdDto) {
    return this.materialsService.deleteOne(id);
  }

  @ZodResponse({ type: ValidationResultDto })
  @Get('validate/:property')
  async getProperty(
    @Param('property', new ValidateObjectKeyPipe<Material>('name'))
    key: keyof Material,
    @Query('value') value: string,
  ) {
    return this.materialsService.validateProperty(key, value);
  }

  @ZodResponse({ type: MaterialDto })
  @Get(':id')
  async getOne(@Param('id') id: ObjectIdDto) {
    return this.materialsService.getOne(id);
  }

  @ZodResponse({ type: [MaterialsListDto] })
  @Get('')
  async getAll(@Query() query: MaterialQueryDto) {
    return this.materialsService.findAll(query);
  }
}
