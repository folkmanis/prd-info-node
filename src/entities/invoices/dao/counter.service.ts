import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../../database/index.js';

interface Counter {
  counter: string;
  lastId: number;
}

@Injectable()
export class InvoicesCounterService {
  private collection: Collection<Counter>;

  constructor(private dbService: DatabaseService) {
    this.collection = this.dbService.db().collection('counters');
  }

  async getNextInvoiceId(nums = 1): Promise<string> {
    const value = await this.collection.findOneAndUpdate(
      {
        counter: 'lastInvoiceId',
      },
      {
        $inc: { lastId: nums },
      },
      {
        returnDocument: 'after',
      },
    );

    if (!value) {
      throw new Error('Error assigning new invoice Id');
    }

    return value.lastId.toString().padStart(5, '0');
  }
}
