import Joi from 'joi';
import { SalesInput } from './sales-input.js';

export const SalesInputSchema = Joi.object<SalesInput>({
  data: Joi.object({
    sale: Joi.object({
      header: Joi.object({
        document: Joi.object({
          client: Joi.object({
            clientID: Joi.number().integer().positive().required(),
          }).required(),
        }).required(),
        saleType: Joi.string().allow('sales_invoice').required(),
        operation: Joi.string().allow('sell_goods').required(),
        shippingData: Joi.object({
          shippingType: Joi.number().default(1),
          warehouse: Joi.object({
            warehouseID: Joi.number().integer().positive(),
          }).optional(),
          loadingArea: Joi.object({
            loadingAreaID: Joi.number().integer().positive(),
            loadingAreaName: Joi.string(),
          }).optional(),
        }),
      }),
      lineItems: Joi.object({
        lineItem: Joi.array().items(
          Joi.object({
            item: Joi.object({
              itemID: Joi.number().integer(),
            }),
            qty: Joi.number(),
            price: Joi.number(),
          }),
        ),
      }),
    }),
  }),
});
