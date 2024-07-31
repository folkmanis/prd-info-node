import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { Modules } from '../../login/index.js';
import { CreateRouteSheetDto } from './dto/create-route-sheet.dto.js';
import { RouteSheetFilterQuery } from './dto/route-sheet-filter.query.js';
import { UpdateRouteSheetDto } from './dto/update-route-sheet.dto.js';
import { TransportationService } from './transportation.service.js';

@Controller('transportation')
@Modules('transportation')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TransportationController {
  constructor(private readonly transportationService: TransportationService) {}

  @Post()
  create(@Body() createTransportationDto: CreateRouteSheetDto) {
    return this.transportationService.create(createTransportationDto);
  }

  @Get(':id')
  findOne(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.transportationService.getOne(id);
  }

  @Get()
  findAll(@Query() query: RouteSheetFilterQuery) {
    return this.transportationService.getAll(query);
  }

  @Patch(':id')
  update(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Body() updateTransportationDto: UpdateRouteSheetDto,
  ) {
    return this.transportationService.update(id, updateTransportationDto);
  }

  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  remove(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.transportationService.delete(id);
  }
}
