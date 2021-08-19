import { Collection, Db, FilterQuery, ObjectId, UpdateWriteOpResult, DeleteWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';
import Logger from '../lib/logger';
import { Equipment } from '../interfaces';
import { Dao, EntityDao } from '../interfaces';


export class EquipmentDao extends Dao implements EntityDao<Equipment> {

    readonly EQUIPMENT_COLLECTION_NAME = 'equipment';

    private equipment!: Collection<Equipment>;

    async injectDb(db: Db): Promise<void> {
        try {
            this.equipment = db.collection(this.EQUIPMENT_COLLECTION_NAME);
        } catch (err) {
            Logger.error('Equipment DAO', err.message);
            return;
        }
        this.createIndexes();
    }

    getArray({ name }: { name?: string; }): Promise<Partial<Equipment[]>> {
        const filter: FilterQuery<Equipment> = {};
        if (name) {
            filter.name = name && new RegExp(name, 'gi');
        }
        return this.equipment
            .find(filter)
            .sort({ name: 1 })
            .toArray();
    }

    getById(id: string): Promise<Equipment | null> {
        return this.equipment.findOne(new ObjectId(id));
    }

    async addOne(entity: Equipment): Promise<InsertOneWriteOpResult<Equipment>> {
        const resp = await this.equipment.insertOne(entity);
        return resp;
    }

    updateOne(id: string, entity: Partial<Equipment>): Promise<UpdateWriteOpResult> {
        return this.equipment.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: entity
            }
        );
    }

    deleteOneById(id: string): Promise<DeleteWriteOpResultObject> {
        return this.equipment.deleteOne(
            { _id: new ObjectId(id) }
        );
    }

    async validationData<K extends keyof Equipment>(key: K): Promise<Array<Equipment[K]>> {
        const resp = await this.equipment.find()
            .project({ _id: 0, [key]: 1 })
            .toArray();
        return resp.map(data => data[key]);
    }

    private createIndexes(): void {
        this.equipment.createIndexes([
            {
                key: { name: 1 },
                unique: true,
            }
        ]);
    }

}

