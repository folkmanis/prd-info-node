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
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { Modules } from '../../login/index.js';
import { CustomersService } from '../customers/customers.service.js';
import { CreateRouteSheetDto } from './dto/create-route-sheet.dto.js';
import { RouteSheetFilterQuery } from './dto/route-sheet-filter.query.js';
import { UpdateRouteSheetDto } from './dto/update-route-sheet.dto.js';
import { TransportationService } from './transportation.service.js';
import { DistanceRequestQuery } from './dto/distance-request.query.js';
import { Response } from 'express';
import { TransportationReport } from './transportation-report/transportation-report.class.js';

@Controller('transportation')
@Modules('transportation')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TransportationController {
  constructor(
    private readonly transportationService: TransportationService,
    private readonly customersService: CustomersService,
  ) {}

  @Put()
  insertOne(@Body() createTransportationDto: CreateRouteSheetDto) {
    return this.transportationService.create(createTransportationDto);
  }

  @Get('report_:id.pdf')
  async getReport(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Res() res: Response,
  ) {
    const data = await this.transportationService.getOne(id);
    const pdf = new TransportationReport(data).open();
    res.contentType('application/pdf');
    pdf.pipe(res);
    pdf.end();

    return {}; // not null response for interceptor
  }

  @Get('customers')
  async getCustomers() {
    return this.customersService.getCustomersWithLocation();
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

  @Post('distance-request')
  @UseInterceptors(new ResponseWrapperInterceptor('distance'))
  distanceRequest(@Body() request: DistanceRequestQuery) {
    return this.transportationService.calculateDistance(request);
  }
}
