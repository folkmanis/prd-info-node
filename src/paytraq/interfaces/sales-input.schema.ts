import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const LineItemSchema = z.object({
  item: z.object({ itemID: z.number().int() }),
  qty: z.number(),
  price: z.number(),
  itemDescription: z.string().optional(),
});

const ShippingDataSchema = z.object({
  shippingType: z.number().default(1),
  warehouse: z.object({ warehouseID: z.number().int().positive() }).optional(),
  loadingArea: z
    .object({
      loadingAreaID: z.number().int().positive(),
      loadingAreaName: z.string().optional(),
    })
    .optional(),
});

const DocumentSchema = z.object({
  client: z.object({
    clientID: z.number().int().positive(),
  }),
});

export const SalesInputSchema = z.object({
  data: z.object({
    sale: z.object({
      header: z.object({
        saleType: z.literal('sales_invoice'),
        operation: z.literal('sell_goods'),
        document: DocumentSchema.optional(),
        shippingData: ShippingDataSchema.optional(),
      }),
      lineItems: z
        .object({
          lineItem: z.array(LineItemSchema),
        })
        .optional(),
    }),
  }),
});

export type SalesInput = z.infer<typeof SalesInputSchema>;

export class SalesInputDto extends createZodDto(SalesInputSchema) {}
