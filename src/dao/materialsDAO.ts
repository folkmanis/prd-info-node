import { MongoClient, Collection, Db } from 'mongodb';
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
    }
}

