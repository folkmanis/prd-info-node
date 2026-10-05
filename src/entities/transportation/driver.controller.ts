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
import { Modules } from '../../login/index.js';
import { DriverService } from './driver.service.js';
import { CreateDriverDto } from './dto/create-driver.dto.js';
import { UpdateDriverDto } from './dto/update-driver.dto.js';
import { TransportationDriver } from './entities/driver.entity.js';
import { ZodResponse } from 'nestjs-zod';
import { DeletedCountDto } from '../../lib/delete-result.dto.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ValidationResultDto } from '../../lib/validation-result.dto.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { DriverQueryDto } from './dto/driver-filter.query.js';
import { DriverDto, DriverListDto } from './dto/driver.dto.js';

@Controller('transportation/driver')
@Modules('transportation')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @ZodResponse({ type: ValidationResultDto })
  @Get('validate/:property')
  async validate(
    @Param('property', new ValidateObjectKeyPipe<TransportationDriver>('name'))
    key: keyof TransportationDriver,
    @Query('value') value: string,
  ) {
    return this.driverService.validate(key, value);
  }

  @ZodResponse({ type: DriverDto })
  @Get(':id')
  findOne(@Param('id') id: ObjectIdDto) {
    return this.driverService.findOne(id);
  }

  @ZodResponse({ type: DriverListDto })
  @Get()
  findAll(@Query() { filter, start, limit }: DriverQueryDto) {
    return this.driverService.findAll(filter, start, limit);
  }

  @ZodResponse({ type: DriverDto })
  @Put()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.insertOne(createDriverDto);
  }

  @ZodResponse({ type: DriverDto })
  @Patch(':id')
  update(
    @Param('id') id: ObjectIdDto,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driverService.updateOne(id, updateDriverDto);
  }

  @ZodResponse({ type: DeletedCountDto })
  @Delete(':id')
  remove(@Param('id') id: ObjectIdDto) {
    return this.driverService.deleteOne(id);
  }
}
