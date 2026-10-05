import { Logger } from '@nestjs/common';
import { Collection, WithId } from 'mongodb';
import { z, ZodObject, ZodType } from 'zod';
import { withIdSchema } from '../lib/zod-validators.js';

export async function deleteEmptyDescription(
  collection: Collection,
  logger?: Logger,
) {
  logger?.log(`Deleting empy description field`);
  const result = await collection.updateMany(
    { description: '' },
    { $unset: { description: '' } },
  );
  logger?.log(
    `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
  );
}

export async function deleteEmptyFields(
  collection: Collection,
  logger?: Logger,
) {
  logger?.log(`Deleting empy fields`);
  const result = await collection.updateMany(
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
  logger?.log(
    `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
  );
}

export async function addDisabledField(
  collection: Collection,
  logger?: Logger,
) {
  logger?.log(`Ensuring "disabled" field`);

  const result = await collection.updateMany(
    {
      $or: [{ disabled: { $exists: false } }, { disabled: null }],
    },
    { $set: { disabled: false } },
  );
  logger?.log(
    `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
  );
}

export async function testAgainstSchema<T extends ZodObject>(
  schema: T,
  collection: Collection,
  logger?: Logger,
) {
  logger?.log(`Testing all documents against schema`);

  let total = 0;
  let invalid = 0;

  for await (const document of collection.find({})) {
    total++;

    const result = withIdSchema(schema).safeEncode(document);

    if (!result.success) {
      invalid++;

      logger?.error(`Invalid document ${document._id}`);
      logger?.error(`Errors ${z.prettifyError(result.error)}`);
    }
  }
  logger?.log(`Processed ${total}, invalid ${invalid} records`);
}
