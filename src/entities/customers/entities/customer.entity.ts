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
}
