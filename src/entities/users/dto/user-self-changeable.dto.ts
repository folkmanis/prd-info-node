import { PartialType, PickType } from '@nestjs/mapped-types';
import { UpdateUserDto } from './update-user.dto.js';

export class UserSelfChangeableDto extends PartialType(
  PickType(UpdateUserDto, ['eMail', 'name', 'google', 'prefersDarkMode']),
) {}
