import { MongoClient, Collection, ObjectId, ObjectID } from "mongodb";
import Logger from '../lib/logger';
import { KastesVeikals, KastesPasutijums, KastesResponse, KastesOrderResponse } from '../interfaces';

interface CleanupResponse { deleted: { pasutijumi: number, veikali: number, }; }

let veikali: Collection<Partial<KastesVeikals>>; // Veikalu piegādes kopējais saraksts
let pasutijumi: Collection<Partial<KastesPasutijums>>; // Pasūtījumi

export class KastesDAO {

    static async injectDB(conn: MongoClient) {
        if (!veikali) {
            try {
                veikali = conn.db(process.env.DB_BASE as string)
                    .collection('kastes-kastes');
                veikali.updateMany(
                    {
                        lastModified: { $exists: false, }
                    },
                    {
                        $currentDate: {
                            lastModified: true,
                        }
                    }
                );
                veikali.createIndexes([
                    {
                        key:
                        {
                            pasutijums: 1,
                            kods: 1
                        },
                        name: 'pasutijums_1',
                    },
                    {
                        key: {
                            lastModified: 1,
                        }
                    }
                ]);
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
     * Saraksts ar pasūtījumiem
     */
    static async pasNames(): Promise<KastesOrderResponse> {
        try {
            const resp = await pasutijumi.find({}).toArray();
            return {
                error: false,
                data: resp,
            };
        } catch (error) { return { error }; }
    }
    /**
     * Pievieno pasūtījumu
     * @param pasutijums Pasūtījuma nosaukums
     */
    static async pasutijumsAdd(pasutijums: Partial<KastesPasutijums>): Promise<KastesOrderResponse> {
        try {
            const pas = {
                ...pasutijums,
                deleted: false,
                created: new Date(),
            };
            const resp = await pasutijumi.insertOne(pas);
            return {
                error: false,
                insertedId: resp.insertedId,
                insertedCount: resp.insertedCount,
            };
        } catch (error) {
            Logger.error('Pasutijums insert error', error);
            return { error };
        }
    }
    /**
     * Izmaina pasūtījuma ierakstu
     * @param id Pasūtījums Id
     * @param pas Izmaiņas
     */
    static async pasutijumsUpdate(id: ObjectId, pas: Partial<KastesPasutijums>): Promise<KastesOrderResponse> {
        try {
            const resp = await pasutijumi.updateOne({ _id: id }, { $set: pas });
            Logger.debug('pas update res', resp.result);
            return {
                error: false,
                modifiedCount: resp.modifiedCount,
            };
        } catch (error) {
            Logger.error('Pasutijums update failed', error);
            return { error };
        }
    }
    /**
     * Izdzēš no pasūtījumiem neaktīvos un atbilstošos no pakošanas
     */
    static async pasutijumiCleanup(): Promise<KastesOrderResponse> {
        try {
            // TODO refactor to one atomic operation
            const saraksts = (await pasutijumi.find<Pick<KastesPasutijums, '_id'>>({ deleted: true }, { projection: { _id: 1 } })
                .toArray())
                .map(pas => pas._id)
            if (!saraksts.length) {
                return {
                    error: false,
                    deletedCount: 0,
                };
            }
            const deletedVeikali = (await veikali.deleteMany({ pasutijums: { $in: saraksts } })).deletedCount || 0;
            const deletedPasutijumi = (await pasutijumi.deleteMany({ _id: { $in: saraksts } })).deletedCount || 0;
            return {
                error: false,
                deletedCount: deletedPasutijumi,
                deleted: {
                    veikali: deletedVeikali,
                    orders: deletedPasutijumi,
                    ids: saraksts,
                }
            };
        } catch (error) { return { error }; }
    }
    /**
     * Pievieno pakošanas sarakstu
     * @param kastes Pakošanas saraksts
     */
    static async veikaliAdd(kastes: KastesVeikals[]): Promise<KastesResponse> {
        try {
            const insertResp = await veikali.insertMany(kastes);
            return {
                error: false,
                insertedCount: insertResp.insertedCount,
            }
        } catch (error) {
            Logger.error('Veikali insert failed', error);
            return {error};
        }
    }

    static async kastesApjomi(pas: ObjectId): Promise<KastesResponse> {
        const pipeline: Array<any> = [{
            $match: { pasutijums: pas }
        }, {
            $unwind: {
                path: '$kastes',
                preserveNullAndEmptyArrays: false
            }
        }, {
            $group: { _id: "$kastes.total" }
        }, {
            $sort: { _id: 1 }
        }, {
            $project: {
                _id: 0,
                total: '$_id'
            }
        }];
        try {
            return {
                error: false,
                apjomi: (await veikali.aggregate<{ total: number; }>(pipeline).toArray()).map(tot => tot.total),
            };
        } catch (error) { return { error }; }
        ;
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
    static async kastesList(pasutijums: ObjectId): Promise<KastesResponse> {
        const kastesPipeline: Array<any> = [{
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
        try {
            return {
                error: false,
                data: await veikali.aggregate(kastesPipeline).toArray(),
            };
        } catch (error) {
            return { error };
        }
    };
    /**
     * Izsniedz vienas piegādes kastes ierakstu
     * @param _id Piegādes ieraksta _id
     * @param kaste Kastas kārtas numurs
     */
    static async getKaste(_id: ObjectId, kaste: number): Promise<KastesResponse> {
        const pipeline = [{
            $match: { _id }
        }, {
            $unwind: {
                path: '$kastes',
                includeArrayIndex: 'kaste',
                preserveNullAndEmptyArrays: false
            }
        }, {
            $match: { kaste }
        }];
        try {
            const res = await veikali.aggregate(pipeline).toArray();
            return {
                error: false,
                data: res[0],
            };
        } catch (error) { return { error }; }

    }
    /**
     * Uzstāda ierakstu kā gatavu
     * @param id Ieraksta ObjectId
     * @param yesno Gatavība jā/nē
     * @param paka Pakas numurs uz veikalu
     */
    static async setGatavs({ id, kaste, yesno, }: { id: ObjectID, kaste: number, yesno: boolean; }): Promise<KastesResponse> {
        // TODO

        Logger.debug('set gatavs dao', { id, kaste, yesno, });
        try {
            const resp = await veikali.updateOne(
                { _id: id },
                {
                    $set: JSON.parse(`{ "kastes.${kaste}.gatavs": ${yesno} }`),
                    $currentDate: { lastModified: true },
                }
            );
            return {
                error: false,
                modifiedCount: resp.modifiedCount,
            };
        } catch (error) { return { error }; }
    }

    static async setLabel(pasutijumsId: ObjectId, kods: number | string): Promise<KastesResponse> {
        try {
            const data = (await veikali.aggregate([{
                $unwind: {
                    path: '$kastes',
                    includeArrayIndex: 'kaste',
                    preserveNullAndEmptyArrays: false
                }
            }, {
                $match: {
                    pasutijums: pasutijumsId,
                    $or: [
                        { kods },
                        { kods: +kods },
                    ],
                    'kastes.uzlime': false
                }
            }]).toArray())[0] || undefined;
            if (!data) {
                return { error: false, modifiedCount: 0, };
            } else {
                const resp = await veikali.updateOne(
                    {
                        pasutijums: pasutijumsId,
                        $or: [
                            { kods },
                            { kods: +kods },
                        ],
                        'kastes.uzlime': false,
                    },
                    {
                        $set: JSON.parse(`{ "kastes.${data.kaste}.uzlime": true }`),
                        $currentDate: { lastModified: true },
                    }
                );
                return {
                    error: false,
                    modifiedCount: resp.modifiedCount,
                    data,
                };
            }
        } catch (error) { return { error }; }

    }

}