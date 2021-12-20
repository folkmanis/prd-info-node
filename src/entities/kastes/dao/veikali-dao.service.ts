import { Inject, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { VeikalsCreateDto } from '../dto/veikals-create.dto';
import { VeikalsUpdateDto } from '../dto/veikals-update.dto';
import { Veikals } from '../entities/veikals';
import { VEIKALI } from './veikali.injector';

@Injectable()
export class VeikaliDaoService {


  constructor(
    @Inject(VEIKALI) private readonly collection: Collection<Veikals>,
  ) { }

  async pasutijums(pasutijums: number): Promise<Veikals[]> {
    return this.collection.find(
      {
        pasutijums,
      },
      {
        sort: {
          kods: 1
        }
      }
    ).toArray();
  }

  async apjomi(pasutijums: number): Promise<number[]> {
    const pipeline: Array<any> = [
      {
        $match: { pasutijums },
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
    const result = await this.collection.aggregate<{ total: number; }>(pipeline).toArray();
    return result.map(total => total.total);
  }


  async insertMany(
    veikali: VeikalsCreateDto[],
    orderIds: number[],
  ): Promise<number> {
    await this.collection.deleteMany({
      pasutijums: {
        $in: orderIds,
      }
    });
    const { insertedCount } = await this.collection.insertMany(veikali);
    return insertedCount;
  }

  async deleteOrder(jobId: number): Promise<number> {
    const { deletedCount } = await this.collection.deleteMany({ pasutijums: jobId });
    return deletedCount || 0;
  }

  async updateOne({ _id, ...update }: VeikalsUpdateDto): Promise<Veikals | null> {
    const { value } = await this.collection.findOneAndUpdate(
      { _id },
      {
        $set: update,
        $currentDate: { lastModified: true },
      },
      { returnDocument: 'after' }
    );
    return value;
  }


}

/*
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


  * Atrod vienu ierakstu no datubāzes pēc tā ID
   * @param _id Ieraksta ID

  async getVeikals(_id: ObjectId): Promise<Veikals | null> {
    return await this.veikali.findOne({ _id });
  }

  * Uzstāda ierakstu kā gatavu
   * @param id Ieraksta ObjectId
   * @param yesno Gatavība jā/nē
   * @param paka Pakas numurs uz veikalu



}

*/