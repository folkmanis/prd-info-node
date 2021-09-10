import { ObjectId } from 'mongodb';
import { IsMongoId, IsString, IsBoolean, IsDate, IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class Financial {

    @IsString()
    clientName: string;
}

export class Customer {

    @Type(() => ObjectId)
    @IsMongoId()
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
