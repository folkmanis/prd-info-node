import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../../database';

interface Counter {
  counter: string;
  lastId: number;
}

@Injectable()
export class JobsCounterService {
  private collection: Collection<Counter>;

  constructor(private dbService: DatabaseService) {
    this.collection = this.dbService.db().collection('counters');
  }

  async getNextJobId(nums = 1): Promise<number> {
    const { value } = await this.collection.findOneAndUpdate(
      {
        counter: 'lastJobId',
      },
      {
        $inc: { lastId: nums },
      },
      {
        returnDocument: 'after',
      },
    );

    if (!value) {
      throw new Error('Error assigning new jobId');
    }

    return value.lastId;
  }
}
