import { ObjectId } from 'mongodb';
import { Material, ProductMaterial } from './materials.interface';


export interface ProductionStage {
    _id: ObjectId;
    name: string;
    description?: string;
    equipmentIds: ObjectId[];
    materials?: Material[];
}

export type ProductProductionStage = Omit<ProductionStage, '_id' | 'equipmentIds' | 'materials'> & {
    productionStageId: ObjectId,
    amount: number,
    fixedAmount: number,
    materials?: ProductMaterial[];
};