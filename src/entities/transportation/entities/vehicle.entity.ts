import { z } from 'zod';
import { isoDatetimeToDate } from '../../../lib/zod-validators.js';

const FuelTypeSchema = z.object({
  type: z.string().nonempty(),
  units: z.string().nonempty(),
  description: z.string(),
});

const OdometerReadingSchema = z.object({
  value: z.number().nonnegative(),
  date: isoDatetimeToDate,
});

export const TransportationVehicleSchema = z.object({
  name: z.string().nonempty(),
  disabled: z.boolean(),
  licencePlate: z.string().toUpperCase(),
  passportNumber: z.string().toUpperCase().nonempty().optional(),
  vin: z.string().toUpperCase().nonempty().optional(),
  consumption: z.number().positive(), // units
  fuelType: FuelTypeSchema,
  odometerReadings: OdometerReadingSchema.array(),
  description: z.string().optional(),
});
export type TransportationVehicle = z.infer<typeof TransportationVehicleSchema>;

export const TransportationVehicleListSchema = TransportationVehicleSchema.pick(
  {
    name: true,
    disabled: true,
    licencePlate: true,
    fuelType: true,
    consumption: true,
  },
);
export type TransportationVehicleList = z.infer<
  typeof TransportationVehicleListSchema
>;
