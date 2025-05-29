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
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { TransportationVehicle } from './entities/vehicle.entity.js';
import { VehicleService } from './vehicle.service.js';
import { Modules } from '../../login/index.js';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { VehicleFilterQuery } from './dto/vehicle-filter.query.js';

@Controller('transportation/vehicle')
@Modules('transportation')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get(':id')
  findOne(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.vehicleService.findOne(id);
  }

  @Get()
  findAll(@Query() query: VehicleFilterQuery) {
    return this.vehicleService.findAll(query);
  }

  @Put()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.insertOne(createVehicleDto);
  }

  @Patch(':id')
  update(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehicleService.updateOne(id, updateVehicleDto);
  }

  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  remove(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.vehicleService.deleteOne(id);
  }

  @Get('validate/:property')
  async validate(
    @Param(
      'property',
      new ValidateObjectKeyPipe<TransportationVehicle>(
        'name',
        'licencePlate',
        'passportNumber',
      ),
    )
    property: keyof TransportationVehicle,
  ) {
    return this.vehicleService.validate(property);
  }
}
