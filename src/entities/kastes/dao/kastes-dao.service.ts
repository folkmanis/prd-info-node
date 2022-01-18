import { Inject, Injectable } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { VEIKALI } from './veikali.injector';
import { Veikals } from '../entities/veikals';
import { VeikalsKaste } from '../dto/veikals-kaste.dto';

@Injectable()
export class KastesDaoService {
  constructor(
    @Inject(VEIKALI) private readonly collection: Collection<Veikals>,
  ) {}

  async findAllKastes(pasutijums: number): Promise<VeikalsKaste[]> {
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
    return this.collection.aggregate<VeikalsKaste>(kastesPipeline).toArray();
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
  ): Promise<VeikalsKaste | null | undefined> {
    const { value: veikals } = await this.collection.findOneAndUpdate(
      { _id },
      {
        $set: JSON.parse(`{ "kastes.${kaste}.gatavs": ${value} }`),
        $currentDate: { lastModified: true },
      },
      {
        returnDocument: 'after',
      },
    );
    return veikals && this.findOneById(veikals._id, kaste);
  }
}
