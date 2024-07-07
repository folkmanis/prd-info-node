import { Inject, Injectable } from '@nestjs/common';
import {
  AnyBulkWriteOperation,
  Collection,
  ObjectId,
  UpdateOneModel,
  WithId,
} from 'mongodb';
import { VEIKALI } from './veikali.injector.js';
import { Veikals } from '../entities/veikals.js';
import { VeikalsKaste } from '../dto/veikals-kaste.dto.js';

@Injectable()
export class KastesDaoService {
  constructor(
    @Inject(VEIKALI) private readonly collection: Collection<Veikals>,
  ) { }

  findAllKastesCursor(pasutijums: number) {
    const kastesPipeline = [
      {
        $match: { pasutijums },
      },
      {
        $sort: { kods: 1 },
      },
      {
        $unwind: {
          path: '$kastes',
          includeArrayIndex: 'kaste',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];
    return this.collection.aggregate<VeikalsKaste>(kastesPipeline);
  }

  findAllKastes(pasutijums: number): Promise<VeikalsKaste[]> {
    return this.findAllKastesCursor(pasutijums).toArray();
  }

  async findOneByPasutijums(
    pasutijums: number,
    kods: number,
    kaste: number,
  ): Promise<VeikalsKaste | undefined> {
    const pipeline = [
      {
        $match: { pasutijums, kods },
      },
      {
        $unwind: {
          path: '$kastes',
          includeArrayIndex: 'kaste',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: { kaste },
      },
    ];
    const [veikals] = await this.collection
      .aggregate<VeikalsKaste>(pipeline)
      .toArray();
    return veikals;
  }

  async findOneById(
    _id: ObjectId,
    kaste: number,
  ): Promise<VeikalsKaste | undefined> {
    const pipeline = [
      {
        $match: { _id },
      },
      {
        $unwind: {
          path: '$kastes',
          includeArrayIndex: 'kaste',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: { kaste },
      },
    ];
    const [veikals] = await this.collection
      .aggregate<VeikalsKaste>(pipeline)
      .toArray();
    return veikals;
  }

  async setLabel(
    pasutijums: number,
    kods: number,
  ): Promise<VeikalsKaste | undefined> {
    const pipeline = [
      {
        $unwind: {
          path: '$kastes',
          includeArrayIndex: 'kaste',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          pasutijums,
          kods,
          'kastes.uzlime': false,
        },
      },
    ];
    const [data] = (await this.collection
      .aggregate(pipeline)
      .toArray()) as VeikalsKaste[];
    if (!data) {
      return undefined;
    }
    await this.collection.updateOne(
      {
        _id: data._id,
      },
      {
        $set: JSON.parse(`{ "kastes.${data.kaste}.uzlime": true }`),
        $currentDate: { lastModified: true },
      },
    );
    return this.findOneById(data._id, data.kaste);
  }

  async setGatavs(
    _id: ObjectId,
    kaste: number,
    value: boolean,
  ): Promise<WithId<Veikals> | null | undefined> {
    return this.collection.findOneAndUpdate(
      { _id },
      {
        $set: JSON.parse(`{ "kastes.${kaste}.gatavs": ${value} }`),
        $currentDate: { lastModified: true },
      },
      {
        returnDocument: 'after',
      },
    );
  }

  async setGatavsBulkUpdate(
    updates: { _id: ObjectId; kaste: number; value: boolean; }[],
  ) {
    const bulkUpdates: AnyBulkWriteOperation<Veikals>[] = updates.map(
      (update) => ({
        updateOne: {
          filter: { _id: update._id },
          update: {
            $set: JSON.parse(
              `{ "kastes.${update.kaste}.gatavs": ${update.value} }`,
            ),
            $currentDate: { lastModified: true },
          },
        },
      }),
    );
    return this.collection.bulkWrite(bulkUpdates);
  }
}
