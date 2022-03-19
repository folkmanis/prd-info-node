import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Message } from '../../../messages';
import { SystemModules } from '../../../preferences';

export class UserPreferences {

  @IsString()
  @IsOptional()
  eMail: string;

  @IsArray()
  customers: string[] = [];

  @IsArray()
  modules: SystemModules[] = [];
}

export class User {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsBoolean()
  userDisabled = false;

  @Type(() => UserPreferences)
  @ValidateNested()
  preferences: UserPreferences;

  @IsArray()
  userPreferences: ModuleUserPreferences[];

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

export type ModuleUserPreferences = Record<string, any>;
