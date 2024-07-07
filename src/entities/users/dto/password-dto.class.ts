import { User } from '../entities/user.interface.js';
import { PickType } from '@nestjs/mapped-types';

export class PasswordDto extends PickType(User, ['password']) { }
