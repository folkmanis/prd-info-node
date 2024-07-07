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
