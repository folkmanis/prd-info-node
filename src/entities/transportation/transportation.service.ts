import { Injectable, NotFoundException } from '@nestjs/common';
import { Filter, ObjectId, WithId } from 'mongodb';
import {
  CalculatedRoute,
  Location,
  RoutingService,
} from '../../google/routing/routing.service.js';
import { assertIsFound, assertNotNull, isFound } from '../../lib/assertions.js';
import { ValidationResult } from '../../lib/validation-result.dto.js';
import { TransportationRouteSheetDaoService } from './dao/route-sheet-dao.service.js';
import { CalculatedDistance } from './dto/calculated-distance.dto.js';
import { CreateRouteSheet } from './dto/create-route-sheet.dto.js';
import {
  DistanceRequest,
  RouteTripStopAddress,
} from './dto/distance-request.dto.js';
import { UpdateRouteSheet } from './dto/update-route-sheet.dto.js';
import { RouteSheetValidationQuery } from './dto/validation-query.dto.js';
import { HistoricalData } from './entities/historical-data.entity.js';
import {
  TransportationRouteSheet,
  TransportationRouteSheetList,
} from './entities/route-sheet.entity.js';

function assertFirstRouteDistance(response: CalculatedRoute): number {
  if (
    !response[0] ||
    !response[0].routes ||
    !response[0]?.routes[0] ||
    typeof response[0].routes[0].distanceMeters !== 'number'
  )
    throw new NotFoundException('No route found');
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

@Injectable()
export class TransportationService {
  constructor(
    private routeSheetDao: TransportationRouteSheetDaoService,
    private routingService: RoutingService,
  ) {}

  async getAll(
    filter: Filter<TransportationRouteSheet>,
    start = 0,
    limit?: number,
  ): Promise<WithId<TransportationRouteSheetList>[]> {
    return this.routeSheetDao.findAll(filter, start, limit);
  }

  async getOne(id: ObjectId): Promise<WithId<TransportationRouteSheet>> {
    return isFound(this.routeSheetDao.getOneById(id));
  }

  async create(
    driver: CreateRouteSheet,
  ): Promise<WithId<TransportationRouteSheet>> {
    return isFound(this.routeSheetDao.insertOne(driver));
  }

  async update(
    id: ObjectId,
    routeSheet: UpdateRouteSheet,
  ): Promise<WithId<TransportationRouteSheet>> {
    return isFound(this.routeSheetDao.updateOne(id, routeSheet));
  }

  async delete(id: ObjectId): Promise<number> {
    return this.routeSheetDao.deleteOneById(id);
  }

  async calculateDistance(
    request: DistanceRequest,
  ): Promise<CalculatedDistance> {
    const stops = request.tripStops.map(getLocation);

    const destination = stops.pop();
    assertNotNull(destination, 'No destination provided');

    const [origin, ...waypoints] = stops;

    try {
      const response = await this.routingService.calculateRoute(
        origin,
        destination,
        waypoints,
      );
      const distance = assertFirstRouteDistance(response);
      return { distance };
    } catch (error) {
      throw new NotFoundException('Route not found', { cause: error });
    }
  }

  async getDescriptions(
    includeDocumentsCount: number,
    limit: number,
  ): Promise<string[]> {
    const result = await this.routeSheetDao.getDescriptions(
      includeDocumentsCount,
      limit,
    );
    return result.map((r) => r._id);
  }

  async getHistoricalData(licencePlate: string): Promise<HistoricalData> {
    const odometers =
      await this.routeSheetDao.getLastMonthAndOdometer(licencePlate);
    assertIsFound(odometers, `No historical data for vehicle ${licencePlate}`);
    const { fuelConsumed, fuelPurchased, fuelRemained } =
      await this.routeSheetDao.getLastTripData(licencePlate);
    return {
      fuelRemaining: fuelRemained + fuelPurchased - fuelConsumed,
      ...odometers,
    };
  }

  async validateNewRouteSheet(
    query: RouteSheetValidationQuery,
  ): Promise<ValidationResult> {
    const count = await this.routeSheetDao.countDocuments(query, 1);
    return {
      valid: count === 0,
      value: query,
      property: 'year,month,vehicle._id,driver._id',
    };
  }
}
