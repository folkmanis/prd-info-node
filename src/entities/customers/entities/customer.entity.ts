import { ObjectId } from 'mongodb';
import { IsMongoId, IsString, IsBoolean, IsDate, IsNotEmpty, ValidateNested, IsOptional, IsNumber, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';

class Financial {

    @IsString()
    clientName: string;

    @IsNumber()
    paytraqId: number;
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

}
