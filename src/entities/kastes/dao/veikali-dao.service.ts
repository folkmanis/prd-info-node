import { Injectable, Inject } from '@nestjs/common';
import { Collection } from 'mongodb';
import { Veikals } from '../entities/kaste.entity';
import { VEIKALI } from './veikali.injector';

@Injectable()
export class VeikaliDaoService {


    constructor(
        @Inject(VEIKALI) private readonly collection: Collection<Veikals>,
    ) { }

}

/*
import { omit } from 'lodash';
import {
  BulkWriteOperation,
  Collection,
  Db,
  ObjectId,
  ObjectID,
} from 'mongodb';
import {
  ApjomiTotals,
  ColorTotals,
  KastesResponse,
  Veikals,
} from '../interfaces';
import { Dao } from '../interfaces/dao.interface';
import Logger from '../lib/logger';


  async colorTotals(pasutijums: number): Promise<ColorTotals[]> {
    const pipeline = [
      { $match: { pasutijums } },
      { $unwind: { path: '$kastes' } },
      {
        $group: {
          _id: null,
          yellow: { $sum: '$kastes.yellow' },
          rose: { $sum: '$kastes.rose' },
          white: { $sum: '$kastes.white' },
        },
      },
      {
        $project: {
          _id: 0,
          totals: [
            { color: 'yellow', total: '$yellow' },
            { color: 'rose', total: '$rose' },
            { color: 'white', total: '$white' },
          ],
        },
      },
      { $unwind: { path: '$totals' } },
      { $replaceRoot: { newRoot: '$totals' } },
    ];
    return this.veikali.aggregate<ColorTotals>(pipeline).toArray();
  }

  async apjomiTotals(pasutijums: number): Promise<ApjomiTotals[]> {
    const pipeline = [
      { $match: { pasutijums } },
      { $unwind: { path: '$kastes' } },
      {
        $group: {
          _id: '$kastes.total',
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          apjoms: '$_id',
          total: 1,
        },
      },
    ];
    return this.veikali.aggregate<ApjomiTotals>(pipeline).toArray();
  }

  async veikaliList(pasutijums: number): Promise<Veikals[]> {
    return this.veikali.find({ pasutijums }).toArray();
  }

  * Pievieno pakošanas sarakstu
   * @param kastes Pakošanas saraksts

  async veikaliAdd(
    orderId: number,
    kastes: Veikals[],
  ): Promise<KastesResponse> {
    try {
      const insertResp = await this.veikali.insertMany(kastes);
      return {
        error: false,
        insertedCount: insertResp.insertedCount,
      };
    } catch (error) {
      Logger.error('Veikali insert failed', error);
      return { error };
    }
  }

  async updateVeikali(kastes: Veikals[]): Promise<KastesResponse> {
    Logger.info('veikals update requested', { kastes });
    try {
      const ops: BulkWriteOperation<Veikals>[] = kastes.map((k) => ({
        updateOne: {
          filter: { _id: new ObjectId(k._id) },
          update: {
            $set: omit(k, ['_id', 'lastModified']),
            $currentDate: { lastModified: true },
          },
        },
      }));
      const result = await this.veikali.bulkWrite(ops);
      Logger.info('veikals update success', result);
      return {
        error: false,
        modifiedCount: result.modifiedCount,
        result: result.result,
      };
    } catch (error) {
      Logger.error('veikals update failed', { kastes });
      return { error };
    }
  }

  async kastesApjomi(pas: number): Promise<KastesResponse> {
    const pipeline: Array<any> = [
      {
        $match: { pasutijums: pas },
      },
      {
        $unwind: {
          path: '$kastes',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: { _id: '$kastes.total' },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          total: '$_id',
        },
      },
    ];
    try {
      return {
        error: false,
        apjomi: (
          await this.veikali.aggregate<{ total: number }>(pipeline).toArray()
        ).map((tot) => tot.total),
      };
    } catch (error) {
      return { error };
    }
  }

  * Atrod vienu ierakstu no datubāzes pēc tā ID
   * @param _id Ieraksta ID

  async getVeikals(_id: ObjectId): Promise<Veikals | null> {
    return await this.veikali.findOne({ _id });
  }

  * Izvērsts saraksts ar pakojumu pa veikaliem
   * @param pasutijums pasūtījuma ID
   * @param apjoms skaits vienā kastē (ja nav norādīts, meklēs visus)

  async kastesList(pasutijums: number): Promise<KastesResponse> {
    const kastesPipeline: Array<any> = [
      {
        $match: {
          pasutijums,
        },
      },
      {
        $sort: {
          kods: 1,
        },
      },
      {
        $unwind: {
          path: '$kastes',
          includeArrayIndex: 'kaste',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];
    try {
      return {
        error: false,
        data: await this.veikali.aggregate(kastesPipeline).toArray(),
      };
    } catch (error) {
      return { error };
    }
  }

  * Izsniedz vienas piegādes kastes ierakstu
   * @param _id Piegādes ieraksta _id
   * @param kaste Kastas kārtas numurs

  async getKaste(_id: ObjectId, kaste: number): Promise<KastesResponse> {
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
    try {
      const res = await this.veikali.aggregate(pipeline).toArray();
      return {
        error: false,
        data: res[0],
      };
    } catch (error) {
      return { error };
    }
  }

  * Uzstāda ierakstu kā gatavu
   * @param id Ieraksta ObjectId
   * @param yesno Gatavība jā/nē
   * @param paka Pakas numurs uz veikalu

  async setGatavs({
    id,
    kaste,
    yesno,
  }: {
    id: ObjectID;
    kaste: number;
    yesno: boolean;
  }): Promise<KastesResponse> {
    // TODO

    Logger.debug('set gatavs dao', { id, kaste, yesno });
    try {
      const resp = await this.veikali.updateOne(
        { _id: id },
        {
          $set: JSON.parse(`{ "kastes.${kaste}.gatavs": ${yesno} }`),
          $currentDate: { lastModified: true },
        },
      );
      return {
        error: false,
        modifiedCount: resp.modifiedCount,
      };
    } catch (error) {
      return { error };
    }
  }

  async setLabel(
    pasutijumsId: number,
    kods: number | string,
  ): Promise<KastesResponse> {
    try {
      const data =
        (
          await this.veikali
            .aggregate([
              {
                $unwind: {
                  path: '$kastes',
                  includeArrayIndex: 'kaste',
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $match: {
                  pasutijums: pasutijumsId,
                  $or: [{ kods }, { kods: +kods }],
                  'kastes.uzlime': false,
                },
              },
            ])
            .toArray()
        )[0] || undefined;
      if (!data) {
        return { error: false, modifiedCount: 0 };
      } else {
        const resp = await this.veikali.updateOne(
          {
            pasutijums: pasutijumsId,
            $or: [{ kods }, { kods: +kods }],
            'kastes.uzlime': false,
          },
          {
            $set: JSON.parse(`{ "kastes.${data.kaste}.uzlime": true }`),
            $currentDate: { lastModified: true },
          },
        );
        return {
          error: false,
          modifiedCount: resp.modifiedCount,
          data,
        };
      }
    } catch (error) {
      return { error };
    }
  }

  async deleteKastes(jobId: number): Promise<KastesResponse> {
    try {
      const resp = this.veikali.deleteMany({ pasutijums: jobId });
      return {
        error: false,
        deletedCount: (await resp).deletedCount,
      };
    } catch (error) {
      return { error };
    }
  }
}

*/