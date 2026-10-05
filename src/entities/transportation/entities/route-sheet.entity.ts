import z from 'zod';
import {
  idToObjectId,
  isoDateToDate,
  withIdSchema,
} from '../../../lib/zod-validators.js';
import { TransportationDriverSchema } from './driver.entity.js';
import { TransportationVehicleSchema } from './vehicle.entity.js';

export const RouteTripStopSchema = z.object({
  customerId: idToObjectId.optional(),
  name: z.string().nonempty(),
  address: z.string().nonempty(),
  googleLocationId: z.string().optional(),
});

const FuelPurchaseSchema = z.object({
  date: isoDateToDate,
  type: z.string().nonempty(),
  units: z.string().nonempty(),
  amount: z.number(),
  price: z.number(),
  total: z.number(),
  invoiceId: z.string().optional(),
});
export type FuelPurchase = z.infer<typeof FuelPurchaseSchema>;

const RouteTripSchema = z.object({
  date: isoDateToDate,
  tripLengthKm: z.number().nonnegative(),
  fuelConsumed: z.number().nonnegative(),
  odoStartKm: z.number().nonnegative(),
  odoStopKm: z.number().nonnegative(),
  description: z.string().max(255),
  stops: RouteTripStopSchema.array(),
});
export type RouteTrip = z.infer<typeof RouteTripSchema>;

export const TransportationRouteSheetSchema = z.object({
  year: z.number().min(1990),
  month: z.number().min(1).max(12),
  fuelRemainingStartLitres: z.number(),
  driver: withIdSchema(TransportationDriverSchema).pick({
    _id: true,
    name: true,
  }),
  vehicle: withIdSchema(TransportationVehicleSchema).pick({
    _id: true,
    name: true,
    consumption: true,
    fuelType: true,
    licencePlate: true,
  }),
  description: z.string().optional(),
  trips: RouteTripSchema.array(),
  fuelPurchases: FuelPurchaseSchema.array(),
});
export type TransportationRouteSheet = z.infer<
  typeof TransportationRouteSheetSchema
>;

export const TransportationRouteSheetListSchema =
  TransportationRouteSheetSchema.pick({
    year: true,
    month: true,
  }).extend({
    driver: TransportationRouteSheetSchema.shape.driver.pick({
      name: true,
      _id: true,
    }),
    vehicle: TransportationRouteSheetSchema.shape.vehicle.pick({
      name: true,
      licencePlate: true,
      _id: true,
    }),
  });
export type TransportationRouteSheetList = z.infer<
  typeof TransportationRouteSheetSchema
>;
