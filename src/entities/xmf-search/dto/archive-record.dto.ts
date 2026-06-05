import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ArchiveRecordSchema = z.object({
  jdfJobId: z.string(),
  descriptiveName: z.string(),
  customerName: z.string(),
  archives: z.array(
    z.object({
      location: z.string().transform((val) => val.replace(/\//g, '\\')),
      date: z.string(),
      action: z.number(),
    }),
  ),
});
export type ArchiveRecord = z.infer<typeof ArchiveRecordSchema>;

const ArchiveProjectionSchema = z
  .object({
    JDFJobID: z.string(),
    DescriptiveName: z.string(),
    CustomerName: z.string(),
    Archives: z.array(
      z.object({
        Location: z.string(),
        Date: z.string(),
        Action: z.number(),
        yearIndex: z.number().optional(),
        monthIndex: z.number().optional(),
      }),
    ),
  })
  .transform(({ JDFJobID, DescriptiveName, CustomerName, Archives }) => ({
    jdfJobId: JDFJobID,
    descriptiveName: DescriptiveName,
    customerName: CustomerName,
    archives: Archives.map(({ Location, Date, Action }) => ({
      location: Location,
      date: Date,
      action: Action,
    })),
  }))
  .pipe(ArchiveRecordSchema);

export class ArchiveRecordDto extends createZodDto(ArchiveProjectionSchema) {}
