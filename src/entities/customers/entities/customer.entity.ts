import { ObjectId } from 'mongodb';
import {
  IsString,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsObject,
  IsEmail,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { z } from 'zod';
import { isoDateToDate } from '../../../lib/zod-validators.js';

class Financial {
  @IsString()
  clientName: string;

  @IsNumber()
  paytraqId: number;
}

class FtpUserData {
  @IsString()
  folder: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

class CustomerContact {
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class ShippingAddress {
  @IsString()
  address: string;

  @IsString()
  zip: string;

  @IsString()
  country: string;

  @IsNumber()
  @IsOptional()
  paytraqId?: number;

  @IsString()
  @IsOptional()
  googleId?: string;
}

export class Customer {
  @Type(() => ObjectId)
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  _id: ObjectId;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  CustomerName: string;

  @IsBoolean()
  disabled?: boolean = false;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  insertedFromXmf?: Date;

  @Type(() => Financial)
  @ValidateNested()
  @IsOptional()
  financial?: Financial;

  @IsBoolean()
  ftpUser: boolean;

  @Type(() => FtpUserData)
  @ValidateNested()
  @IsOptional()
  ftpUserData?: FtpUserData;

  @Type(() => CustomerContact)
  @ValidateNested({ each: true })
  contacts?: CustomerContact[];

  @Type(() => ShippingAddress)
  @ValidateNested()
  @IsOptional()
  shippingAddress?: ShippingAddress;
}

// Zod schemas corresponding to the above classes
export const FinancialSchema = z.object({
  clientName: z.string(),
  paytraqId: z.coerce.number(),
});

export const FtpUserDataSchema = z.object({
  folder: z.string(),
  username: z.string().nullish(),
  password: z.string().nullish(),
});

export const CustomerContactSchema = z.object({
  email: z.email().nullish(),
});

export const ShippingAddressSchema = z.object({
  address: z.string(),
  zip: z.string(),
  country: z.string(),
  paytraqId: z.number().nullish(),
  googleId: z.string().nullish(),
});

export const CustomerSchema = z
  .object({
    code: z.string(),
    CustomerName: z.string(),
    disabled: z.boolean().nullish(),
    description: z.string().nullish(),
    insertedFromXmf: isoDateToDate.nullish(),
    financial: FinancialSchema.nullish(),
    ftpUser: z.boolean(),
    ftpUserData: FtpUserDataSchema.nullish(),
    contacts: z.array(CustomerContactSchema).nullish(),
    shippingAddress: ShippingAddressSchema.nullish(),
  })
  .meta({ id: 'CustomerSchema' });
