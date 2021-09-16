import { Job } from '../entities/job.entity';
import { OmitType, IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';

export class CreateJobDto extends OmitType(Job, ['_id', 'jobId']) { }
