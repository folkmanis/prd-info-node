import { MongoClient, Collection, ObjectId, DeleteWriteOpResultObject } from "mongodb";
import Logger from '../lib/logger';
import { KastesVeikals, KastesPasutijums } from '../lib/kastes-class';

interface CleanupResponse { deleted: { pasutijumi: number, veikali: number, }; }

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
        return (await pasutijumi.find({}).toArray());
    }
    /**
     * Pievieno pasūtījumu
     * @param name Pasūtījuma nosaukums
     */
    static async pasutijumsAdd(name: string): Promise<{ _id: ObjectId; } | null> {
        try {
            const pas = {
                name,
                deleted: false,
                created: new Date(Date.now()),
            };
            const insertRes = await pasutijumi.insertOne(pas);
            return insertRes.result.ok ? { _id: insertRes.insertedId } : null;
        } catch (e) {
            Logger.error('Pasutijums insert error', e);
            return null;
        }
    }
    /**
     * Izmaina pasūtījuma ierakstu
     * @param id Pasūtījums Id
     * @param pas Izmaiņas
     */
    static async pasutijumsUpdate(id: ObjectId, pas: Partial<KastesPasutijums>): Promise<{ changedRows: number; } | null> {
        try {
            const res = await pasutijumi.updateOne({ _id: id }, { $set: pas });
            Logger.debug('pas update res', res.result);
            return { changedRows: res.result.nModified };
        } catch (e) {
            Logger.error('Pasutijums update failed', e);
            return null;
        }
    }
    /**
     * Izdzēš no pasūtījumiem neaktīvos un atbilstošos no pakošanas
     */
    static async pasutijumiCleanup(): Promise<CleanupResponse> {
        const resp: CleanupResponse = { deleted: { veikali: 0, pasutijumi: 0 } };
        const saraksts = (await pasutijumi.find({ deleted: true }, { projection: { _id: 1 } }).toArray()).map(pas => pas._id);
        if (!saraksts.length) {
            return resp;
        }
        resp.deleted.veikali = (await veikali.deleteMany({ pasutijums: { $in: saraksts } })).deletedCount || 0;
        resp.deleted.pasutijumi = (await pasutijumi.deleteMany({ _id: { $in: saraksts } })).deletedCount || 0;
        return resp;
    }
    /**
     * Pievieno pakošanas sarakstu
     * @param kastes Pakošanas saraksts
     */
    static async veikaliAdd(kastes: KastesVeikals[]): Promise<number | null> {
        try {
            const insertRes = await veikali.insertMany(kastes);
            return insertRes.result.ok ? insertRes.result.n : null;
        } catch (e) {
            Logger.error('Veikali insert failed', e);
            return null;
        }
    }

    static async veikaliTotals(pas: ObjectId): Promise<any> {
        const pipeline: Array<any> = [{
            $match: { pasutijums: pas }
        }, {
            $unwind: {
                path: '$kastes',
                preserveNullAndEmptyArrays: false
            }
        }, {
            $group: { _id: { $sum: ["$kastes.yellow", "$kastes.rose", "$kastes.white"] } }
        }, {
            $sort: { _id: 1 }
        }, {
            $project: {
                _id: 0,
                total: '$_id'
            }
        }];
        return await veikali.aggregate(pipeline).toArray();
    };
    /**
     * Atrod vienu ierakstu no datubāzes pēc tā ID
     * @param _id Ieraksta ID
     */
    static async getVeikals(_id: ObjectId): Promise<KastesVeikals | null> {
        return await veikali.findOne({ _id });
    };
    /**
     * Izvērsts saraksts ar pakojumu pa veikaliem
     * @param pasutijums pasūtījuma ID
     * @param apjoms skaits vienā kastē (ja nav norādīts, meklēs visus)
     */
    static async kastesList(pasutijums: ObjectId, apjoms?: number): Promise<any> {
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
    };
    /**
     * Uzstāda ierakstu kā gatavu
     * @param id Ieraksta ObjectId
     * @param yesno Gatavība jā/nē
     * @param paka Pakas numurs uz veikalu
     */
    static async setGatavs(field: string, id: ObjectId, kaste: number, yesno: boolean): Promise<{ changedRows: number; } | null> {
        // TODO

        const update = { $set: JSON.parse(`{ "kastes.${kaste}.${field}": ${yesno} }`) };
        Logger.debug('set gatavs dao', update);
        try {
            // return { changedRows: 0 };
            return (await veikali.updateOne({ _id: id }, update)).result.ok ? { changedRows: 1 } : null;
        } catch (e) {
            Logger.error('Veikals update failed', { id, yesno });
            return null;
        }
    }


}