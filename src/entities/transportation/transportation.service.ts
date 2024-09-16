import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import {
  CalculatedRoute,
  Location,
  RoutingService,
} from '../../google/routing/routing.service.js';
import { TransportationRouteSheetDaoService } from './dao/route-sheet-dao.service.js';
import { CreateRouteSheetDto } from './dto/create-route-sheet.dto.js';
import {
  DistanceRequestQuery,
  RouteTripStopAddress,
} from './dto/distance-request.query.js';
import { RouteSheetFilterQuery } from './dto/route-sheet-filter.query.js';
import { UpdateRouteSheetDto } from './dto/update-route-sheet.dto.js';
import { TransportationRouteSheet } from './entities/route-sheet.entity.js';

@Injectable()
export class TransportationService {
  constructor(
    private routeSheetDao: TransportationRouteSheetDaoService,
    private routingService: RoutingService,
  ) {}

  async getAll(
    query: RouteSheetFilterQuery,
  ): Promise<Partial<TransportationRouteSheet>[]> {
    return this.routeSheetDao.findAll(query.toFilter());
  }

  async getOne(id: ObjectId): Promise<TransportationRouteSheet> {
    const data = await this.routeSheetDao.getOneById(id);
    if (!data) {
      throw new NotFoundException({ message: 'Route sheet not found', id });
    }
    return data;
  }

  async create(
    driver: CreateRouteSheetDto,
  ): Promise<TransportationRouteSheet | null | undefined> {
    return this.routeSheetDao.insertOne(driver);
  }

  async update(
    id: ObjectId,
    routeSheet: UpdateRouteSheetDto,
  ): Promise<TransportationRouteSheet | null> {
    return this.routeSheetDao.updateOne(id, routeSheet);
  }

  async delete(id: ObjectId): Promise<number> {
    return this.routeSheetDao.deleteOneById(id);
  }

  async calculateDistance(request: DistanceRequestQuery): Promise<number> {
    const stops = request.tripStops.map(getLocation);
    const destination = stops.pop();
    if (!destination) {
      throw new BadRequestException('No destination provided');
    }
    const [origin, ...waypoints] = stops;

    const response = await this.routingService.calculateRoute(
      origin,
      destination,
      waypoints,
    );

    return assertFirstRouteDistance(response)!;
  }
}

function assertFirstRouteDistance(response: CalculatedRoute): number {
  if (
    !response[0] ||
    !response[0].routes ||
    !response[0]?.routes[0] ||
    typeof response[0].routes[0].distanceMeters !== 'number'
  )
    throw new Error('No route found');
  return response[0].routes[0].distanceMeters;
}

function getLocation(stop: RouteTripStopAddress): Location {
  if (stop.googleLocationId) {
    return {
      placeId: stop.googleLocationId,
    };
  } else {
    return {
      address: stop.address,
    };
  }
}
