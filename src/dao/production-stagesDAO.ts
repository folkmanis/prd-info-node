import { Collection, Db, FilterQuery, ObjectId, UpdateWriteOpResult, DeleteWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';
import Logger from '../lib/logger';
import { ProductionStage } from '../interfaces';
import { Dao, EntityDao } from '../interfaces';


export class ProductionStagesDao extends Dao implements EntityDao<ProductionStage> {

    readonly PRODUCTIONSTAGE_COLLECTION_NAME = 'productionStages';

    private productionStage!: Collection<ProductionStage>;

    async injectDb(db: Db): Promise<void> {
        try {
            this.productionStage = db.collection(this.PRODUCTIONSTAGE_COLLECTION_NAME);
        } catch (err) {
            Logger.error('ProductionStage DAO', err.message);
            return;
        }
        this.createIndexes();
    }

    getArray({ name }: { name?: string; }): Promise<Partial<ProductionStage[]>> {
        const filter: FilterQuery<ProductionStage> = {};
        if (name) {
            filter.name = name && new RegExp(name, 'gi');
        }
        return this.productionStage
            .find(filter)
            .project({
                _id: 1,
                name: 1,
                equipmentIds: 1,
            })
            .sort({ name: 1 })
            .toArray();
    }

    getById(id: string): Promise<ProductionStage | null> {
        return this.productionStage.findOne(new ObjectId(id));
    }

    async addOne(entity: ProductionStage): Promise<InsertOneWriteOpResult<ProductionStage>> {
        return this.productionStage.insertOne({
            ...entity,
            equipmentIds: entity.equipmentIds?.map(eq => new ObjectId(eq)) || [],
        });
    }

    updateOne(id: string, entity: Partial<ProductionStage>): Promise<UpdateWriteOpResult> {
        if (entity.equipmentIds) {
            entity.equipmentIds = entity.equipmentIds.map(eq => new ObjectId(eq));
        }
        return this.productionStage.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: entity
            }
        );
    }

    deleteOneById(id: string): Promise<DeleteWriteOpResultObject> {
        return this.productionStage.deleteOne(
            { _id: new ObjectId(id) }
        );
    }

    async validationData<K extends keyof ProductionStage>(key: K): Promise<Array<ProductionStage[K]>> {
        const resp = await this.productionStage.find()
            .project({ _id: 0, [key]: 1 })
            .toArray();
        return resp.map(data => data[key]);
    }

    private createIndexes(): void {
        this.productionStage.createIndexes([
            {
                key: { name: 1 },
                unique: true,
            }
        ]);
    }

}

