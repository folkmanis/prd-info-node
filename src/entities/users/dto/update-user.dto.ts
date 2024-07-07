import { PartialType, OmitType } from '@nestjs/mapped-types';
import { User } from '../entities/user.interface.js';

export class UpdateUserDto extends PartialType(OmitType(User, ['username'])) { }
