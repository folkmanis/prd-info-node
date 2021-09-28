import { Modules, MODULES } from '../../../interfaces/preferences.interface';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsBoolean, ArrayContains, IsInstance, IsString, IsArray, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Message } from '../../../messages';

export class UserPreferences {

  @IsArray()
  customers: string[] = [];

  @IsArray()
  modules: Modules[] = [];
}

export class User {

  @IsNotEmpty() @IsString()
  username: string;

  @IsString()
  name: string;

  @IsNotEmpty() @IsString()
  password: string;

  @IsBoolean()
  userDisabled: boolean = false;

  @Type(() => UserPreferences)
  @ValidateNested()
  preferences: UserPreferences;

  @IsArray()
  modulePreferences: ModuleUserPreferences[] = [];

  last_login?: Date;
  sessions?: UserSession[];
  messages?: Message[];

}

export class UserUpdate extends PartialType(User) { }

export interface UserSession {
  _id: string;
  lastSeen: {
    date: Date;
    ip: string;
  };
}

export interface ModuleUserPreferences {
  module: Modules;
  options?: any;
}
