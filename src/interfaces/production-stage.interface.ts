import { ObjectId } from 'mongodb';

export interface ProductionStage {
    _id: ObjectId;
    name: string;
    description?: string;
    equipmentIds: string[];
}
