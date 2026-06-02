import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { Invoice, INVOICE_SCHEMA } from '../entities/invoice.entity.js';

export const INVOICES_COLLECTION_NAME = 'invoices';
export const INVOICES_COLLECTION = Symbol(INVOICES_COLLECTION_NAME);

export const invoicesCollectionProvider: FactoryProvider = {
  provide: INVOICES_COLLECTION,
  inject: [DatabaseService],
  useFactory: async (dbService: DatabaseService) => {
    const collection = dbService
      .db()
      .collection<Invoice>(INVOICES_COLLECTION_NAME);

    try {
      await dbService.db().createCollection(INVOICES_COLLECTION_NAME, {
        validator: {
          $jsonSchema: INVOICE_SCHEMA,
        },
      });
    } catch (error) {}

    collection.createIndexes([
      {
        key: { invoiceId: 1 },
        unique: true,
      },
    ]);
    return collection;
  },
};
