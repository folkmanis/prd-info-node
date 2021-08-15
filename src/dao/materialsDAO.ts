import { Collection, Db, FilterQuery, ObjectId, UpdateWriteOpResult, DeleteWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';
import Logger from '../lib/logger';
import { Material } from '../interfaces/materials.interface';
import { Dao } from '../interfaces/dao.interface';


export class MaterialsDao extends Dao {

    readonly MATERIALS_COLLECTION_NAME = 'materials';

    private materials!: Collection<Material>;

    async injectDb(db: Db): Promise<void> {
        try {
            this.materials = db.collection(this.MATERIALS_COLLECTION_NAME);
        } catch (err) {
            Logger.error('Materials DAO', err.message);
            return;
        }
        this.createIndexes();
    }

    getMaterials({ name, categories }: { name?: string, categories?: string; }): Promise<Partial<Material[]>> {
        const filter: FilterQuery<Material> = {};
        if (categories) {
            filter.category = {
                $in: categories.split(',')
            };
        }
        if (name) {
            filter.name = name && new RegExp(name, 'gi');
        }
        return this.materials
            .find(filter)
            .sort({ category: 1, name: 1 })
            .toArray();
    }

    getMaterialById(id: string): Promise<Material | null> {
        return this.materials.findOne(new ObjectId(id));
    }

    async addMaterial(mat: Material): Promise<InsertOneWriteOpResult<Material>> {
        const resp = await this.materials.insertOne(mat);
        return resp;
    }

    updateMaterial(id: string, mat: Partial<Material>): Promise<UpdateWriteOpResult> {
        return this.materials.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: mat
            }
        );
    }

    deleteMaterial(id: string): Promise<DeleteWriteOpResultObject> {
        return this.materials.deleteOne(
            { _id: new ObjectId(id) }
        );
    }

    async validationData<K extends keyof Material>(key: K): Promise<Array<Material[K]>> {
        const resp = await this.materials.find()
            .project({ _id: 0, [key]: 1 })
            .toArray();
        return resp.map(data => data[key]);
    }

    private createIndexes(): void {
        this.materials.createIndexes([
            {
                key: { name: 1 },
                unique: true,
            }
        ]);
    }

}

