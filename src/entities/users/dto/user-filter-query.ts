import { IsOptional, IsString } from 'class-validator';
import { Filter } from 'mongodb/mongodb.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { User } from '../entities/user.interface.js';

export class UserFilterQuery extends StartLimitFilter<User> {
  @IsString()
  @IsOptional()
  name?: string;

  toFilter(): FilterType<User> {
    const { start, limit, name } = this;
    const filter: Filter<User> = {};
    if (name) {
      filter.$or = [
        { username: { $regex: name, $options: 'i' } },
        { name: { $regex: name, $options: 'i' } },
        { eMail: { $regex: name, $options: 'i' } },
      ];
    }
    return {
      start,
      limit,
      filter,
    };
  }
}
