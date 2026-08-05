import { Filter } from 'mongodb';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { pickNotNull } from '../../../lib/pick-not-null.js';
import {
  isoDatetimeToDate,
  stringToArray,
  stringToInt,
} from '../../../lib/zod-validators.js';
import { JOB_CATEGORIES } from '../entities/job-categories.js';
import { Job } from '../entities/job.entity.js';

const regexSearchSchema = z.string().transform((value) => ({
  $regex: value,
  $options: 'i',
}));

const invoiceSchema = z
  .stringbool({ truthy: ['1'], falsy: ['0'] })
  .transform((value) => ({ $exists: value }));

const inArraySchema = <T extends z.ZodType<unknown, string>>(schema: T) =>
  stringToArray(schema).transform((value) => ({
    $in: value,
  }));

export const JobFilterSchema = z
  .object({
    fromDate: isoDatetimeToDate,
    toDate: isoDatetimeToDate,
    customer: z.string(),
    name: regexSearchSchema,
    invoice: invoiceSchema,
    jobStatus: inArraySchema(stringToInt),
    jobsId: inArraySchema(stringToInt),
    productsName: regexSearchSchema,
    category: JOB_CATEGORIES,
    unwindProducts: z.stringbool({ truthy: ['1'], falsy: ['0'] }),
    start: stringToInt,
    limit: stringToInt,
  })
  .partial()
  .transform((query) => {
    const {
      start,
      limit,
      toDate,
      fromDate,
      invoice,
      jobsId,
      jobStatus,
      category,
      productsName,
      unwindProducts,
      ...params
    } = query;
    const filter: Filter<Job> = pickNotNull({
      ...params,
      invoiceId: invoice,
      jobId: jobsId,
      'jobStatus.generalStatus': jobStatus,
      'production.category': category,
      'products.name': productsName,
    });

    if (fromDate || toDate) {
      filter.receivedDate = pickNotNull({
        $gte: fromDate,
        $lte: toDate,
      });
    }

    const description = pickNotNull({
      jobStatus: jobStatus?.$in,
      fromDate,
      toDate,
      customer: params.customer,
      jobsId: jobsId?.$in,
      name: query.name?.$regex,
      productsName: productsName?.$regex,
    });

    return {
      start,
      limit,
      filter,
      unwindProducts: !!unwindProducts,
      description,
    };
  });
export type JobFilter = z.infer<typeof JobFilterSchema>;

export class JobFilterDto extends createZodDto(JobFilterSchema, {
  codec: true,
}) {}
