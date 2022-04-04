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
import { google, oauth2_v2 } from 'googleapis';
import { Credentials } from 'google-auth-library';

export class UserPreferences {

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
  userDisabled: boolean;

  @Type(() => UserPreferences)
  @ValidateNested()
  preferences: UserPreferences;

  @IsArray()
  userPreferences: ModuleUserPreferences[];

  @IsString()
  @IsOptional()
  eMail: string;

  @IsOptional()
  google?: oauth2_v2.Schema$Userinfo;

  tokens?: Credentials;
  last_login?: Date;
  sessions?: UserSession[];
  messages?: Message[];


}

export interface UserSession {
  _id: string;
  lastSeen: {
    date: Date;
    ip: string;
  };
}

export type ModuleUserPreferences = Record<string, any>;
