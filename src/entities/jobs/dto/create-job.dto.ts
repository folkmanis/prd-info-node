import { Job } from '../entities/job.entity';
import { OmitType, IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';

export class CreateJobDto extends IntersectionType(
    OmitType(Job, ['_id', 'jobId']),
    PartialType(Job)
) { }