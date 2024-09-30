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
  ParseIntPipe,
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
import { transportationReport } from './transportation-report/transportation-report.js';

@Controller('transportation')
@Modules('transportation')
export class TransportationController {
  constructor(
    private readonly transportationService: TransportationService,
    private readonly customersService: CustomersService,
  ) {}

  @Put()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  insertOne(@Body() createTransportationDto: CreateRouteSheetDto) {
    return this.transportationService.create(createTransportationDto);
  }

  @Get('report_:id.pdf')
  async getReport(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Res() res: Response,
  ) {
    const data = await this.transportationService.getOne(id);
    const pdf = transportationReport(data);
    res.contentType('application/pdf');
    pdf.pipe(res);
    pdf.end();

    return {}; // not null response for interceptor
  }

  @Get('customers')
  async getCustomers() {
    return this.customersService.getCustomersWithLocation();
  }

  @Get('descriptions')
  async getDescriptions(
    @Query('count', new ParseIntPipe({ optional: true })) count: number,
  ) {
    return this.transportationService.getDescriptions(count);
  }

  @Get('historical-data/:licencePlate')
  async getHistoricalData(@Param('licencePlate') licencePlate: string) {
    return this.transportationService.getHistoricalData(licencePlate);
  }

  @Get(':id')
  findOne(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.transportationService.getOne(id);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAll(@Query() query: RouteSheetFilterQuery) {
    return this.transportationService.getAll(query);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(new ResponseWrapperInterceptor('distance'))
  distanceRequest(@Body() request: DistanceRequestQuery) {
    return this.transportationService.calculateDistance(request);
  }
}
