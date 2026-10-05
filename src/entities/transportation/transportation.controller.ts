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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import { z } from 'zod';
import { DeletedCountDto } from '../../lib/delete-result.dto.js';
import { AllowNullResponse } from '../../lib/null-response.interceptor.js';
import { ValidationResultDto } from '../../lib/validation-result.dto.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { CustomersService } from '../customers/customers.service.js';
import { CustomerWithLocationDto } from '../customers/dto/customer-with-location.dto.js';
import { CalculatedDistanceDto } from './dto/calculated-distance.dto.js';
import { CreateRouteSheetDto } from './dto/create-route-sheet.dto.js';
import { DescriptionsQueryDto } from './dto/descriptions-query.dto.js';
import { DistanceRequestDto } from './dto/distance-request.dto.js';
import { HistoricalDataDto } from './dto/historical-data.dto.js';
import { RouteSheetQueryDto } from './dto/route-sheet-filter.query.js';
import { RouteSheetDto, RouteSheetListDto } from './dto/route-sheet.dto.js';
import { UpdateRouteSheetDto } from './dto/update-route-sheet.dto.js';
import { RouteSheetValidationQueryDto } from './dto/validation-query.dto.js';
import { transportationReport } from './transportation-report/transportation-report.js';
import { TransportationService } from './transportation.service.js';

@Controller('transportation')
@Modules('transportation')
export class TransportationController {
  constructor(
    private readonly transportationService: TransportationService,
    private readonly customersService: CustomersService,
  ) {}

  @ZodResponse({ type: RouteSheetDto })
  @Put()
  insertOne(@Body() createTransportationDto: CreateRouteSheetDto) {
    return this.transportationService.create(createTransportationDto);
  }

  @AllowNullResponse()
  @Get('report_:id.pdf')
  async getReport(@Param('id') id: ObjectIdDto, @Res() res: Response) {
    const data = await this.transportationService.getOne(id);
    const pdf = await transportationReport(data).getStream();
    res.contentType('application/pdf');
    pdf.pipe(res);
    pdf.end();
    return;
  }

  @ZodResponse({ type: ValidationResultDto })
  @Get('validate')
  async validateRouteSheet(@Query() query: RouteSheetValidationQueryDto) {
    return this.transportationService.validateNewRouteSheet(query);
  }

  @ZodResponse({ type: CustomerWithLocationDto })
  @Get('customers')
  async getCustomers() {
    return this.customersService.getCustomersWithLocation();
  }

  @ZodResponse({ type: [createZodDto(z.string())] })
  @Get('descriptions')
  async getDescriptions(@Query() query: DescriptionsQueryDto) {
    return this.transportationService.getDescriptions(
      query.includeDocumentsCount,
      query.limit,
    );
  }

  @ZodResponse({ type: HistoricalDataDto })
  @Get('historical-data/:licencePlate')
  async getHistoricalData(@Param('licencePlate') licencePlate: string) {
    return this.transportationService.getHistoricalData(licencePlate);
  }

  @ZodResponse({ type: RouteSheetDto })
  @Get(':id')
  findOne(@Param('id') id: ObjectIdDto) {
    return this.transportationService.getOne(id);
  }

  @ZodResponse({ type: RouteSheetListDto })
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() { filter, start, limit }: RouteSheetQueryDto) {
    return this.transportationService.getAll(filter, start, limit);
  }

  @ZodResponse({ type: RouteSheetDto })
  @Patch(':id')
  update(
    @Param('id') id: ObjectIdDto,
    @Body() updateTransportationDto: UpdateRouteSheetDto,
  ) {
    return this.transportationService.update(id, updateTransportationDto);
  }

  @ZodResponse({ type: DeletedCountDto })
  @Delete(':id')
  remove(@Param('id') id: ObjectIdDto) {
    return this.transportationService.delete(id);
  }

  @ZodResponse({ type: CalculatedDistanceDto })
  @Post('distance-request')
  @UsePipes(new ValidationPipe({ transform: true }))
  distanceRequest(@Body() request: DistanceRequestDto) {
    return this.transportationService.calculateDistance(request);
  }
}
