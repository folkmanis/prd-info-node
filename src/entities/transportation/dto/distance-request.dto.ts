import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { RouteTripStopSchema } from '../entities/route-sheet.entity.js';

const RouteTripStopAddressSchema = RouteTripStopSchema.pick({
  address: true,
  googleLocationId: true,
});
export type RouteTripStopAddress = z.infer<typeof RouteTripStopAddressSchema>;

const DistanceRequestSchema = z.object({
  tripStops: RouteTripStopAddressSchema.array().min(2).max(10),
});
export type DistanceRequest = z.infer<typeof DistanceRequestSchema>;
export class DistanceRequestDto extends createZodDto(DistanceRequestSchema, {
  codec: true,
}) {}
