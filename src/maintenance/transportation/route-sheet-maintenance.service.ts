import { Inject, Injectable, Logger } from '@nestjs/common';
import { Collection, UpdateResult, WithId } from 'mongodb';
import { TRANSPORTATION_ROUTE_SHEET_COLLECTION } from '../../entities/transportation/dao/route-sheet-provider.js';
import {
  addDisabledField,
  deleteEmptyDescription,
  deleteEmptyFields,
  testAgainstSchema,
} from '../maintenance-tools.js';
import {
  TransportationRouteSheet,
  TransportationRouteSheetSchema,
} from '../../entities/transportation/entities/route-sheet.entity.js';
import { z } from 'zod';
import { withIdSchema } from '../../lib/zod-validators.js';

// remove deep nulls and convert id strings to ObjectId's
function removeNulls(collection: Collection): Promise<UpdateResult> {
  return collection.updateMany({}, [
    {
      $set: {
        trips: {
          $map: {
            input: '$trips',
            as: 'trip',
            in: {
              $let: {
                vars: {
                  tripFields: {
                    $objectToArray: '$$trip',
                  },
                },
                in: {
                  $arrayToObject: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$$tripFields',
                          as: 'field',
                          cond: {
                            $ne: ['$$field.v', null],
                          },
                        },
                      },
                      as: 'field',
                      in: {
                        k: '$$field.k',
                        v: {
                          $cond: [
                            { $eq: ['$$field.k', 'stops'] },

                            {
                              $map: {
                                input: '$$field.v',
                                as: 'stop',
                                in: {
                                  $arrayToObject: {
                                    $map: {
                                      input: {
                                        $filter: {
                                          input: {
                                            $objectToArray: '$$stop',
                                          },
                                          as: 'stopField',
                                          cond: {
                                            $ne: ['$$stopField.v', null],
                                          },
                                        },
                                      },
                                      as: 'stopField',
                                      in: {
                                        k: '$$stopField.k',
                                        v: {
                                          $cond: [
                                            {
                                              $and: [
                                                {
                                                  $eq: [
                                                    '$$stopField.k',
                                                    'customerId',
                                                  ],
                                                },
                                                {
                                                  $eq: [
                                                    {
                                                      $type: '$$stopField.v',
                                                    },
                                                    'string',
                                                  ],
                                                },
                                                {
                                                  $eq: [
                                                    {
                                                      $strLenCP:
                                                        '$$stopField.v',
                                                    },
                                                    24,
                                                  ],
                                                },
                                                {
                                                  $regexMatch: {
                                                    input: '$$stopField.v',
                                                    regex: '^[0-9a-fA-F]{24}$',
                                                  },
                                                },
                                              ],
                                            },
                                            {
                                              $toObjectId: '$$stopField.v',
                                            },
                                            '$$stopField.v',
                                          ],
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },

                            '$$field.v',
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        fuelPurchases: {
          $map: {
            input: '$fuelPurchases',
            as: 'purchase',
            in: {
              $arrayToObject: {
                $filter: {
                  input: {
                    $objectToArray: '$$purchase',
                  },
                  as: 'field',
                  cond: {
                    $ne: ['$$field.v', null],
                  },
                },
              },
            },
          },
        },

        driver: {
          $arrayToObject: {
            $map: {
              input: {
                $filter: {
                  input: {
                    $objectToArray: '$driver',
                  },
                  as: 'field',
                  cond: {
                    $ne: ['$$field.v', null],
                  },
                },
              },
              as: 'field',
              in: {
                k: '$$field.k',
                v: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$$field.k', '_id'] },
                        {
                          $eq: [{ $type: '$$field.v' }, 'string'],
                        },
                        {
                          $regexMatch: {
                            input: '$$field.v',
                            regex: '^[0-9a-fA-F]{24}$',
                          },
                        },
                      ],
                    },
                    { $toObjectId: '$$field.v' },
                    '$$field.v',
                  ],
                },
              },
            },
          },
        },

        vehicle: {
          $arrayToObject: {
            $map: {
              input: {
                $filter: {
                  input: {
                    $objectToArray: '$vehicle',
                  },
                  as: 'field',
                  cond: {
                    $ne: ['$$field.v', null],
                  },
                },
              },
              as: 'field',
              in: {
                k: '$$field.k',
                v: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$$field.k', '_id'] },
                        {
                          $eq: [{ $type: '$$field.v' }, 'string'],
                        },
                        {
                          $regexMatch: {
                            input: '$$field.v',
                            regex: '^[0-9a-fA-F]{24}$',
                          },
                        },
                      ],
                    },
                    { $toObjectId: '$$field.v' },
                    '$$field.v',
                  ],
                },
              },
            },
          },
        },
      },
    },
  ]);
}

@Injectable()
export class RouteSheetMaintenanceService {
  private logger = new Logger('Transportation Route Sheet Maintenance');
  constructor(
    @Inject(TRANSPORTATION_ROUTE_SHEET_COLLECTION)
    private collection: Collection,
  ) {}

  async performTasks() {
    await deleteEmptyDescription(this.collection, this.logger);
    await deleteEmptyFields(this.collection, this.logger);
    await addDisabledField(this.collection, this.logger);
    await this.removeEmptyRouteStopCustomerId();
    await this.createIndexes();
    await testAgainstSchema(
      withIdSchema(TransportationRouteSheetSchema),
      this.collection,
      this.logger,
    );
  }

  private async removeEmptyRouteStopCustomerId() {
    this.logger.log(`Removing empty route stop customer Id`);

    const result = await removeNulls(this.collection);

    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async createIndexes() {
    await this.collection.createIndexes([
      {
        key: {
          year: 1,
        },
      },
      {
        key: {
          month: 1,
        },
      },
      {
        key: {
          year: -1,
          month: -1,
        },
      },
      {
        key: {
          'driver.name': 1,
        },
      },
      {
        key: {
          'driver._id': 1,
        },
      },
      {
        key: {
          'vehicle.licencePlate': 1,
        },
      },
    ]);
  }
}
