import { Inject, Injectable } from '@nestjs/common';
import { flatten } from 'flat';
import { Collection, ObjectId } from 'mongodb';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { CreateRouteSheetDto } from '../dto/create-route-sheet.dto.js';
import { TransportationRouteSheet } from '../entities/route-sheet.entity.js';
import { TRANSPORTATION_ROUTE_SHEET_COLLECTION } from './route-sheet-provider.js';

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
          year: 1,
          month: 1,
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
      { $set: flatten(obj, { safe: true }) },
      { returnDocument: 'after' },
    );
  }

  async deleteOneById(id: ObjectId): Promise<number> {
    const response = await this.collection.deleteOne({ _id: id });
    return response.deletedCount;
  }
}
