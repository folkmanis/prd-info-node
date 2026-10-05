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
import { ZodResponse } from 'nestjs-zod';
import { DeletedCountDto } from '../../lib/delete-result.dto.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ValidationResultDto } from '../../lib/validation-result.dto.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { VehicleQueryDto } from './dto/vehicle-filter.query.js';
import { VehicleDto, VehicleListDto } from './dto/vehicle.dto.js';
import { TransportationVehicle } from './entities/vehicle.entity.js';
import { VehicleService } from './vehicle.service.js';

@Controller('transportation/vehicle')
@Modules('transportation')
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @ZodResponse({ type: ValidationResultDto })
  @Get('validate/:property')
  async validate(
    @Param(
      'property',
      new ValidateObjectKeyPipe<TransportationVehicle>(
        'name',
        'licencePlate',
        'passportNumber',
        'vin',
      ),
    )
    key: keyof TransportationVehicle,
    @Query('value') value: string,
  ) {
    return this.vehicleService.validateProperty(key, value);
  }

  @ZodResponse({ type: VehicleDto })
  @Get(':id')
  findOne(@Param('id') id: ObjectIdDto) {
    return this.vehicleService.findOne(id);
  }

  @ZodResponse({ type: VehicleListDto })
  @Get()
  findAll(@Query() { filter, start, limit }: VehicleQueryDto) {
    return this.vehicleService.findAll(filter, start, limit);
  }

  @ZodResponse({ type: VehicleDto })
  @Put()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.insertOne(createVehicleDto);
  }

  @ZodResponse({ type: VehicleDto })
  @Patch(':id')
  update(
    @Param('id') id: ObjectIdDto,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehicleService.updateOne(id, updateVehicleDto);
  }

  @ZodResponse({ type: DeletedCountDto })
  @Delete(':id')
  remove(@Param('id') id: ObjectIdDto) {
    return this.vehicleService.deleteOne(id);
  }
}
