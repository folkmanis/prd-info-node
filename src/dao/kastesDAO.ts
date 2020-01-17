import { MongoClient, Collection, ObjectId } from "mongodb";
import Logger from '../lib/logger';
import { KastesVeikals, KastesPasutijums } from '../lib/kastes-class';

let veikali: Collection<Partial<KastesVeikals>>; // Veikalu piegādes kopējais saraksts
let pasutijumi: Collection<Partial<KastesPasutijums>>; // Pasūtījumi

export default class KastesDAO {

    static async injectDB(conn: MongoClient) {
        if (!veikali) {
            try {
                veikali = conn.db(process.env.DB_BASE as string)
                    .collection('kastes-kastes');
            } catch (e) {
                Logger.error('kastesDAO: unable to connect kastes-kastes', e);
            }
        }

        if (!pasutijumi) {
            try {
                pasutijumi = conn.db(process.env.DB_BASE as string)
                    .collection('kastes-pasutijumi');
            } catch (e) {
                Logger.error('kastesDAO: unable to connect pasutijumi', e);
            }
        }
    }
    /**
     * Saraksts ar pasūtījumiem, kas nav dzēsti
     */
    static async pasNames(): Promise<Partial<KastesPasutijums>[]> {
        const projection = { deleted: 0 };
        return (await pasutijumi.find({ deleted: false }, { projection }).toArray());
    }
    /**
     * Pievieno pasūtījumu
     * @param name Pasūtījuma nosaukums
     */
    static async pasutijumsAdd(name: string): Promise<{ _id: ObjectId; } | null> {
        try {
            const insertRes = await pasutijumi.insertOne({ name, deleted: false, });
            return insertRes.result.ok ? { _id: insertRes.insertedId } : null;
        } catch (e) {
            Logger.error('Pasutijums insert error', e);
            return null;
        }
    }
    /**
     * Atzīmē pasūtījumu kā dzēstu
     * @param id Pasūtījuma ObjectId
     */
    static async pasutijumsDelete(id: ObjectId): Promise<boolean> {
        try {
            return !!(await pasutijumi.updateOne({ _id: id }, { $set: { deleted: true } })).result.ok;
        } catch (e) {
            Logger.error('Pasutijums delete error', e);
            return false;
        }
    }
    /**
     * Pievieno pakošanas sarakstu
     * @param kastes Pakošanas saraksts
     */
    static async veikaliAdd(kastes: KastesVeikals[]): Promise<{ count: number; } | null> {
        try {
            const insertRes = await veikali.insertMany(kastes);
            return insertRes.result.ok ? { count: insertRes.result.n } : null;
        } catch (e) {
            Logger.error('Veikali insert failed', e);
            return null;
        }
    }

    static async veikaliTotals(pas: ObjectId): Promise<any> {
        // TODO
        return {};
    }
    /**
     * Atrod vienu ierakstu no datubāzes pēc tā ID
     * @param _id Ieraksta ID
     */
    static async getVeikals(_id: ObjectId): Promise<KastesVeikals | null> {
        return await veikali.findOne({ _id });
    }
    /**
     * Izvērsts saraksts ar pakojumu pa veikaliem
     * @param pasutijums pasūtījuma ID
     * @param apjoms skaits vienā kastē (ja nav norādīts, meklēs visus)
     */
    static async veikaliList(pasutijums: ObjectId, apjoms?: number): Promise<any> {
        const pipeline: Array<any> = [{
            $match: {
                pasutijums
            }
        }, {
            $sort: {
                kods: 1,
            }
        }, {
            $unwind: {
                path: '$kastes',
                includeArrayIndex: 'kaste',
                preserveNullAndEmptyArrays: false
            }
        }];
        if (apjoms) {
            pipeline.push({
                $match: {
                    "kastes.total": apjoms
                }
            });
        }
        return await veikali.aggregate(pipeline).toArray();
    }
    /**
     * Uzstāda ierakstu kā gatavu
     * @param id Ieraksta ObjectId
     * @param yesno Gatavība jā/nē
     * @param paka Pakas numurs uz veikalu
     */
    static async setGatavs(id: ObjectId, paka: number, yesno: boolean): Promise<{ count: number; } | null> {
        // TODO
        try {
            return (await veikali.updateOne({ _id: id }, {})).result.ok ? { count: 1 } : null;
        } catch (e) {
            Logger.error('Veikals update failed', { id, yesno });
            return null;
        }
    }


}