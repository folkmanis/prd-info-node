import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ThreadsFilterSchema = z
  .object({
    maxResults: z.number().int().positive(),
    pageToken: z.string(),
    q: z.string(),
    labelIds: z.array(z.string()),
    includeSpamTrash: z.stringbool(),
  })
  .partial();

export const ThreadsQuerySchema = z
  .object({
    maxResults: z.string(),
    pageToken: z.string(),
    q: z.string(),
    labelIds: z.string(),
    includeSpamTrash: z.string(),
  })
  .partial();

export const threadsQueryToFilter = z.codec(
  ThreadsQuerySchema,
  ThreadsFilterSchema,
  {
    encode: (filter) => ({
      ...filter,
      maxResults: filter.maxResults?.toFixed(0),
      labelIds: filter.labelIds?.join(','),
    }),
    decode: (query) => ({
      ...query,
      labelIds:
        typeof query.labelIds === 'string'
          ? query.labelIds.split(',')
          : undefined,
      maxResults: query.maxResults
        ? Number.parseInt(query.maxResults)
        : undefined,
    }),
  },
);

export type ThreadsFilter = z.output<typeof threadsQueryToFilter>;
export type ThreadsQuery = z.input<typeof threadsQueryToFilter>;

export class ThreadsQueryDto extends createZodDto(threadsQueryToFilter, {
  codec: true,
}) {}
