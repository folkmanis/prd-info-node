import { Inject, Injectable, Logger } from '@nestjs/common';
import { MATERIALS_COLLECTION } from '../entities/materials/dao/materials-collection.provider.js';
import { Collection } from 'mongodb';
import { Material } from '../entities/materials/entities/material.entity.js';

const MATERIALS_BSON_SCHEMA = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'units', 'category', 'inactive', 'prices', 'fixedPrice'],
    additionalProperties: false,
    properties: {
      name: {
        bsonType: 'string',
      },
      description: {
        bsonType: 'string',
      },
      units: {
        bsonType: 'string',
      },
      category: {
        bsonType: 'string',
      },
      inactive: {
        bsonType: 'bool',
      },
      fixedPrice: {
        bsonType: ['double', 'int', 'long', 'decimal'],
        minimum: 0,
      },
      prices: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['price', 'min'],
          additionalProperties: false,
          properties: {
            price: {
              bsonType: ['double', 'int', 'long', 'decimal'],
              minimum: 0,
            },
            min: {
              bsonType: ['double', 'int', 'long', 'decimal'],
              minimum: 0,
            },
            description: {
              bsonType: ['string', 'null'],
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class MaterialsMaintenanceService {
  private logger = new Logger('Materials maintenance');

  constructor(
    @Inject(MATERIALS_COLLECTION)
    private materialsCollection: Collection,
  ) {}

  async performTasks() {
    await this.deleteEmptyFields();
    await this.deleteEmptyDescription();
    await this.addInactiveField();
    await this.removeEmptyPriceDescription();
    await this.ensureFixedPrice();
  }

  private async deleteEmptyFields() {
    this.logger.log(`Deleting empy fields`);
    const result = await this.materialsCollection.updateMany(
      {}, // Match all documents
      [
        {
          $set: {
            // Convert document to an array of k/v pairs, filter out nulls, convert back to object
            rootAsArray: {
              $filter: {
                input: { $objectToArray: '$$ROOT' },
                cond: { $ne: ['$$this.v', null] },
              },
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: { $arrayToObject: '$rootAsArray' },
          },
        },
      ],
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async deleteEmptyDescription() {
    this.logger.log(`Deleting empy description field`);
    const result = await this.materialsCollection.updateMany(
      { description: '' },
      { $unset: { description: '' } },
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async addInactiveField() {
    this.logger.log(`Ensuring "inactive" field`);

    const result = await this.materialsCollection.updateMany(
      {
        $or: [{ inactive: { $exists: false } }, { inactive: null }],
      },
      { $set: { inactive: false } },
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async ensureFixedPrice() {
    this.logger.log(`Ensuring "fixedPrice" field`);

    const result = await this.materialsCollection.updateMany(
      {
        $or: [{ fixedPrice: { $exists: false } }, { fixedPrice: null }],
      },
      { $set: { fixedPrice: 0 } },
    );

    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async removeEmptyPriceDescription() {
    this.logger.log('Removing unused price.description field');
    const result = await this.materialsCollection.updateMany({}, [
      {
        $set: {
          prices: {
            $map: {
              input: '$prices',
              as: 'price',
              in: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$$price.description', null] },
                      { $eq: ['$$price.description', ''] },
                    ],
                  },
                  {
                    $unsetField: {
                      field: 'description',
                      input: '$$price',
                    },
                  },
                  '$$price',
                ],
              },
            },
          },
        },
      },
    ]);
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }
}
