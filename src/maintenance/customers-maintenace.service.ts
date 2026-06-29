import { Inject, Injectable, Logger } from '@nestjs/common';
import { CUSTOMERS_COLLECTION } from '../entities/customers/customers-dao/customers-provider.js';
import { Collection } from 'mongodb';

@Injectable()
export class CustomersMaintenanceService {
  private logger = new Logger('Customers Maintenance');

  constructor(
    @Inject(CUSTOMERS_COLLECTION)
    private customersCollection: Collection,
  ) {}

  async performTasks() {
    await this.renameFields();
    await this.removeEmptyFtpUserData();
    await this.cleanFtpUserData();
    await this.removeFtpUser();
    await this.deleteEmptyFields();
    await this.cleanupShippingAddress();
    await this.addDisabledField();
    await this.deleteEmptyDescription();
    await this.createIndexes();
  }

  private async deleteEmptyFields() {
    this.logger.log(`Deleting empy fields`);
    const result = await this.customersCollection.updateMany(
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
    this.logger.log(`Deleting empy fields`);
    const result = await this.customersCollection.updateMany(
      { description: '' },
      { $unset: { description: '' } },
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async cleanupShippingAddress() {
    this.logger.log(`Removing empty shippingAddress fields`);
    const result = await this.customersCollection.updateMany(
      {
        shippingAddress: {
          $type: 'object',
        },
      },
      [
        {
          $set: {
            shippingAddress: {
              $arrayToObject: {
                $filter: {
                  input: {
                    $objectToArray: '$shippingAddress',
                  },
                  cond: {
                    $ne: ['$$this.v', null],
                  },
                },
              },
            },
          },
        },
      ],
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async removeEmptyFtpUserData() {
    this.logger.log(`Removing ftpUser data for non-ftp users`);
    const result = await this.customersCollection.updateMany(
      { ftpUserData: { $exists: true }, 'ftpUserData.folder': null }, // Filter: Only look at documents where ftpUser is false
      [
        {
          $unset: 'ftpUserData', // Pipeline stage: Remove the ftpUserData field
        },
      ],
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }
  private async removeFtpUser() {
    this.logger.log(`Removing ftpUser data field`);
    const result = await this.customersCollection.updateMany(
      { ftpUser: { $exists: true } },
      [
        {
          $unset: 'ftpUser', // Pipeline stage: Remove the ftpUser field
        },
      ],
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async cleanFtpUserData() {
    this.logger.log(`Removing empty ftpUser.username and ftpUser.password`);
    const result = await this.customersCollection.updateMany(
      {
        ftpUserData: { $ne: null },
      },
      [
        {
          $set: {
            'ftpUserData.password': {
              $cond: {
                if: {
                  $or: [
                    {
                      $eq: ['$ftpUserData.password', null],
                    },
                    {
                      $and: [
                        {
                          $eq: [
                            {
                              $type: '$ftpUserData.password',
                            },
                            'string',
                          ],
                        },

                        {
                          $eq: [
                            {
                              $strLenCP: '$ftpUserData.password',
                            },
                            0,
                          ],
                        },
                      ],
                    },
                    {
                      $eq: ['$ftpUserData.username', null],
                    },
                    {
                      $and: [
                        {
                          $eq: [
                            {
                              $type: '$ftpUserData.username',
                            },
                            'string',
                          ],
                        },
                        {
                          $eq: [
                            {
                              $strLenCP: '$ftpUserData.username',
                            },
                            0,
                          ],
                        },
                      ],
                    },
                  ],
                },
                then: '$$REMOVE',
                else: '$ftpUserData.password',
              },
            },
            'ftpUserData.username': {
              $cond: {
                if: {
                  $or: [
                    {
                      $eq: ['$ftpUserData.username', null],
                    },
                    {
                      $and: [
                        {
                          $eq: [
                            {
                              $type: '$ftpUserData.username',
                            },
                            'string',
                          ],
                        },
                        {
                          $eq: [
                            {
                              $strLenCP: '$ftpUserData.username',
                            },
                            0,
                          ],
                        },
                      ],
                    },
                  ],
                },
                then: '$$REMOVE',
                else: '$ftpUserData.username',
              },
            },
          },
        },
      ],
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async addDisabledField() {
    this.logger.log(`Ensuring "disabled" field`);

    const result = await this.customersCollection.updateMany(
      {
        $or: [{ disabled: { $exists: false } }, { disabled: null }],
      },
      { $set: { disabled: false } },
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async renameFields() {
    this.logger.log(`Renaming "CustomerName" to "customerName"`);

    this.logger.log(`Dropping old indexes`);
    const indexes = await this.customersCollection.indexes();
    const index = indexes.find((i) => !!i.key['CustomerName']);
    if (index && index.name) {
      this.logger.log(`Index ${index.name} found`);
      await this.customersCollection.dropIndex(index.name);
      this.logger.log(`Index ${index.name} dropped`);
    } else {
      this.logger.log(`No index on "CustomerName" found`);
    }

    const result = await this.customersCollection.updateMany(
      {},
      { $rename: { CustomerName: 'customerName' } },
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async createIndexes() {
    this.logger.log(`Recreating indexes`);
    await this.customersCollection.createIndexes([
      {
        key: {
          customerName: 1,
        },
        unique: true,
      },
      {
        key: {
          code: 1,
        },
        unique: true,
        partialFilterExpression: {
          code: { $exists: true },
        },
      },
      {
        key: {
          'contacts.email': 1,
        },
      },
      {
        key: {
          'ftpUserData.folder': 1,
        },
      },
    ]);
  }
}
