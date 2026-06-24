import { formatISO } from 'date-fns';
import { ObjectId } from 'mongodb';
import { createZodDto } from 'nestjs-zod';
import { z, ZodType } from 'zod';

export const stringToInt = z.codec(
  z.string().regex(z.regexes.integer),
  z.int(),
  {
    decode: (str) => Number.parseInt(str, 10),
    encode: (num) => num.toString(),
  },
);

export const stringToArray = <T>(schema: ZodType<T>) =>
  z.codec(z.string(), z.array(schema), {
    decode: (str) => str.split(','),
    encode: (arr) => arr.join(','),
  });

export const idToObjectId = z.codec(
  z.string().length(24),
  z.instanceof(ObjectId),
  {
    decode: (val, ctx) => {
      try {
        return new ObjectId(val);
      } catch (error) {
        ctx.issues.push({
          code: 'custom',
          message: `${val} expected to be ObjectId instance or a string of 24 hex characters. Received ${val}`,
          input: val,
        });
      }
      return z.NEVER;
    },
    encode: (id) => id.toHexString(),
  },
);
export class ObjectIdDto extends createZodDto(idToObjectId) {}

export const withIdSchema = <T extends Record<string, any>>(
  schema: z.ZodObject<T>,
) =>
  schema.extend({
    _id: idToObjectId,
  });

export const isoDateToDate = z.codec(z.iso.date(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => formatISO(date, { representation: 'date' }),
});

export const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});
