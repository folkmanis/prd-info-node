import { PartialType, OmitType } from '@nestjs/mapped-types';
import { User } from '../entities/user.interface';

export class UpdateUserDto extends PartialType(OmitType(User, ['username'])) {}
