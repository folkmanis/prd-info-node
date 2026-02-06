import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { flatten } from 'flat';
import { defaults } from 'lodash-es';
import { Collection, ObjectId } from 'mongodb';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { CreateRouteSheetDto } from '../dto/create-route-sheet.dto.js';
import { TransportationRouteSheet } from '../entities/route-sheet.entity.js';
import { TRANSPORTATION_ROUTE_SHEET_COLLECTION } from './route-sheet-provider.js';

export interface DescriptionsAggregationParams {
  includeDocumentsCount?: number;
  resultsLimit?: number;
}

export interface DescriptionsAggregation {
  _id: string;
  count: number;
}

const DEFAULT_DESCRIPTIONS_AGGREGATION_PARAMS: DescriptionsAggregationParams = {
  includeDocumentsCount: 100,
  resultsLimit: 10,
};

export interface LastMonthAndOdometer {
  lastYear: number;
  lastMonth: number;
  lastOdometer: number;
}

export interface LastTripData {
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

  async findAll({
    start,
    limit,
    filter,
  }: FilterType<TransportationRouteSheet>): Promise<
    Partial<TransportationRouteSheet>[]
  > {
    return this.collection
      .find(filter, {
        sort: {
          year: -1,
          month: -1,
        },
        skip: start,
        limit,
      })
      .toArray();
  }

  async getOneById(id: ObjectId): Promise<TransportationRouteSheet | null> {
    return this.collection.findOne({ _id: id });
  }

  async insertOne(
    obj: CreateRouteSheetDto,
  ): Promise<TransportationRouteSheet | null | undefined> {
    const { insertedId } = await this.collection.insertOne(
      obj as TransportationRouteSheet,
    );
    return { ...obj, _id: insertedId };
  }

  async updateOne(
    id: ObjectId,
    obj: Partial<TransportationRouteSheet>,
  ): Promise<TransportationRouteSheet | null> {
    return this.collection.findOneAndUpdate(
      { _id: id },
      { $set: flatten(instanceToPlain(obj), { safe: true }) },
      { returnDocument: 'after' },
    );
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const response = await this.collection.deleteOne({ _id: id });
    return response.deletedCount;
  }

  async getDescriptions(
    params: DescriptionsAggregationParams = {},
  ): Promise<DescriptionsAggregation[]> {
    const { includeDocumentsCount, resultsLimit } = defaults(
      params,
      DEFAULT_DESCRIPTIONS_AGGREGATION_PARAMS,
    );
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
  ): Promise<LastMonthAndOdometer> {
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
