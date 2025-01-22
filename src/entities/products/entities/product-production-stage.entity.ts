import { Transform, Type } from 'class-transformer';
import { IsNumber, IsObject, ValidateNested } from 'class-validator';
import { ObjectId } from 'mongodb';

export class ProductProductionStageMaterial {
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
  materialId: ObjectId;

  @IsNumber()
  amount: number;

  @IsNumber()
  fixedAmount: number;
}

export class ProductProductionStage {
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
  productionStageId: ObjectId;

  @IsNumber()
  amount: number;

  @IsNumber()
  fixedAmount: number;

  @Type(() => ProductProductionStageMaterial)
  @ValidateNested({ each: true })
  materials: ProductProductionStageMaterial[];
}
