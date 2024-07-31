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
import { CreateDriverDto } from './dto/create-driver.dto.js';
import { UpdateDriverDto } from './dto/update-driver.dto.js';
import { TransportationDriver } from './entities/driver.entity.js';
import { DriverService } from './driver.service.js';
import { Modules } from '../../login/index.js';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { DriverFilterQuery } from './dto/driver-filter.query.js';

@Controller('transportation/driver')
@Modules('transportation')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Get(':id')
  findOne(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.driverService.findOne(id);
  }

  @Get()
  findAll(@Query() query: DriverFilterQuery) {
    return this.driverService.findAll(query);
  }

  @Put()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.insertOne(createDriverDto);
  }

  @Patch(':id')
  update(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driverService.updateOne(id, updateDriverDto);
  }

  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  remove(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.driverService.deleteOne(id);
  }

  @Get('validate/:property')
  async validate(
    @Param('property', new ValidateObjectKeyPipe<TransportationDriver>('name'))
    property: keyof TransportationDriver,
  ) {
    return this.driverService.validate(property);
  }
}
