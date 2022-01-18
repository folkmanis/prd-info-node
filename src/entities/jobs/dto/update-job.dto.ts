import { IntersectionType, PickType, PartialType } from '@nestjs/mapped-types';
import { Job } from '../entities/job.entity';

export class UpdateJobDto extends IntersectionType(
  PickType(Job, ['jobId']),
  PartialType(Job),
) {}
