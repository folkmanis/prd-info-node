import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Message } from '../../../messages/index.js';
import { SystemModules } from '../../../preferences/index.js';
import { oauth2_v2 } from 'googleapis';
import { Credentials } from 'google-auth-library';
import { Binary } from 'mongodb';

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
  @IsOptional()
  userPreferences?: ModuleUserPreferences[];

  @IsString()
  @IsOptional()
  eMail?: string;

  @IsOptional()
  google?: oauth2_v2.Schema$Userinfo;

  tokens?: Credentials;
  last_login?: Date;
  sessions?: UserSession[];
  messages?: Message[];

  avatar?: {
    image: Binary;
    type?: string;
  };
}

export interface UserSession {
  _id: string;
  lastSeen: {
    date: Date;
    ip: string;
  };
}

export type ModuleUserPreferences = Record<string, any>;
