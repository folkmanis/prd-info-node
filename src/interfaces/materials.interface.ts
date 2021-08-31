import { ObjectId } from 'mongodb';

export interface Material {
    _id: ObjectId;
    name: string;
    description?: string;
    units: string;
    category: string;
    inactive: boolean;
}

export interface ProductMaterial {
    materialId: ObjectId;
    amount: number;
    fixedAmount: number;
}
