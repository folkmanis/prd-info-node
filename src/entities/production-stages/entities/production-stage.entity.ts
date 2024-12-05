import { ObjectId } from 'mongodb';
import { IsString, IsOptional, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DropFolder } from './drop-folder.entity.js';

export class ProductionStage {
  @Type(() => ObjectId)
  @Transform(
    ({ value }) =>
      typeof value === 'string' ? ObjectId.createFromHexString(value) : value,
    { toClassOnly: true },
  )
  @Transform(({ value }) => value.toString(), {
    toPlainOnly: true,
  })
  @IsObject()
  _id: ObjectId;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => ObjectId)
  @Transform(
    ({ value }) =>
      [...value].map((id) =>
        typeof id === 'string' ? ObjectId.createFromHexString(id) : id,
      ),
    {
      toClassOnly: true,
    },
  )
  @IsObject({ each: true })
  equipmentIds: ObjectId[];

  @Type(() => ObjectId)
  @Transform(
    ({ value }) =>
      typeof value === 'string' ? ObjectId.createFromHexString(value) : value,
    { toClassOnly: true },
  )
  @Transform(({ value }) => value.toString(), {
    toPlainOnly: true,
  })
  @IsObject()
  @IsOptional()
  defaultEquipmentId?: ObjectId;

  @Type(() => DropFolder)
  @IsOptional()
  @IsObject({ each: true })
  dropFolders: DropFolder[];
}
