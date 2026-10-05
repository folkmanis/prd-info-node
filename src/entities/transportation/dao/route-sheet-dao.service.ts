import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { flatten } from 'flat';
import { defaults } from 'lodash-es';
import { Collection, Filter, ObjectId, WithId } from 'mongodb';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import {
  CreateRouteSheet,
  CreateRouteSheetDto,
} from '../dto/create-route-sheet.dto.js';
import {
  TransportationRouteSheet,
  TransportationRouteSheetList,
} from '../entities/route-sheet.entity.js';
import { TRANSPORTATION_ROUTE_SHEET_COLLECTION } from './route-sheet-provider.js';
import { UpdateRouteSheetDto } from '../dto/update-route-sheet.dto.js';

interface DescriptionsAggregation {
  _id: string;
  count: number;
}

interface LastMonthAndOdometer {
  lastYear: number;
  lastMonth: number;
  lastOdometer: number;
}

interface LastTripData {
  fuelPurchased: number;
  fuelRemained: number;
  fuelConsumed: number;
}

@Injectable()
export class TransportationRouteSheetDaoService {
  constructor(
    @Inject(TRANSPORTATION_ROUTE_SHEET_COLLECTION)
    private collection: Collection<TransportationRouteSheet>,
  ) {}

  async findAll(
    filter: Filter<TransportationRouteSheet>,
    start = 0,
    limit?: number,
  ): Promise<WithId<TransportationRouteSheetList>[]> {
    return this.collection
      .find(filter, {
        sort: {
          year: -1,
          month: -1,
        },
        skip: start,
        limit,
        projection: {
          year: 1,
          month: 1,
          'driver._id': 1,
          'driver.name': 1,
          'vehicle._id': 1,
          'vehicle.name': 1,
          'vehicle.licencePlate': 1,
        },
      })
      .toArray();
  }

  async getOneById(
    id: ObjectId,
  ): Promise<WithId<TransportationRouteSheet> | null> {
    return this.collection.findOne({ _id: id });
  }

  async insertOne(
    create: CreateRouteSheet,
  ): Promise<WithId<TransportationRouteSheet> | null> {
    return this.collection.findOneAndReplace(
      {
        year: create.year,
        month: create.month,
        'vehicle.licencePlate': create.vehicle.licencePlate,
        'driver._id': create.driver._id,
      },
      create,
      { upsert: true, returnDocument: 'after' },
    );
  }

  countDocuments(
    filter: Filter<TransportationRouteSheet>,
    limit?: number,
  ): Promise<number> {
    return this.collection.countDocuments(filter, { limit });
  }

  async updateOne(
    id: ObjectId,
    updateOperations: UpdateRouteSheetDto,
  ): Promise<WithId<TransportationRouteSheet> | null> {
    return this.collection.findOneAndUpdate({ _id: id }, updateOperations, {
      returnDocument: 'after',
    });
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    return deletedCount;
  }

  async getDescriptions(
    includeDocumentsCount: number,
    resultsLimit: number,
  ): Promise<DescriptionsAggregation[]> {
    const pipeline = [
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
      {
        $limit: includeDocumentsCount,
      },
      {
        $project: {
          'trips.description': 1,
          _id: 0,
        },
      },
      {
        $unwind: {
          path: '$trips',
        },
      },
      {
        $group: {
          _id: '$trips.description',
          count: {
            $count: {},
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: resultsLimit,
      },
    ];
    const result = await this.collection
      .aggregate<DescriptionsAggregation>(pipeline)
      .toArray();
    return result;
  }

  async getLastMonthAndOdometer(
    licencePlate: string,
  ): Promise<LastMonthAndOdometer | undefined> {
    const pipeline = [
      {
        $match: {
          'vehicle.licencePlate': licencePlate,
        },
      },
      {
        $unwind: {
          path: '$trips',
          includeArrayIndex: 'tripIdx',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null,
          lastYear: {
            $max: '$year',
          },
          lastMonth: {
            $max: '$month',
          },
          lastOdometer: {
            $max: '$trips.odoStopKm',
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const result = await this.collection
      .aggregate<LastMonthAndOdometer>(pipeline)
      .toArray();
    return result[0];
  }

  async getLastTripData(licencePlate: string): Promise<LastTripData> {
    const pipeline = [
      {
        $match: {
          'vehicle.licencePlate': licencePlate,
        },
      },
      {
        $sort: {
          year: -1,
          month: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $group: {
          _id: null,
          fuelPurchased: {
            $sum: {
              $sum: '$fuelPurchases.amount',
            },
          },
          fuelRemained: {
            $first: '$fuelRemainingStartLitres',
          },
          fuelConsumed: {
            $sum: {
              $sum: '$trips.fuelConsumed',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const result = await this.collection
      .aggregate<LastTripData>(pipeline)
      .toArray();

    return (
      result[0] ?? {
        fuelPurchased: 0,
        fuelRemained: 0,
        fuelConsumed: 0,
      }
    );
  }
}
