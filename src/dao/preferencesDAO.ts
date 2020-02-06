import { MongoClient, Collection, ObjectId, BulkWriteOpResultObject } from "mongodb";
import Logger from '../lib/logger';
import { Preferences } from '../lib/preferences-class';
import { flattenObject } from '../lib/flatten-object';

interface BulkUpdateOne {
    updateOne: {
        filter: { [key: string]: any; },
        update: {
            $set: { [key: string]: any; };
        },
        upsert?: boolean,
    };
}

const defaults: Preferences[] = [
    {
        module: 'kastes',
        settings: {
            yellow: 'hsl(45,75%,50%)',
            rose: 'hsl(315,75%,50%)',
            white: 'hsl(0,0%,50%)',
        }
    },
];

let preferences: Collection<Preferences>;

export class PreferencesDAO {
    static async injectDB(conn: MongoClient) {
        if (preferences) {
            return;
        }
        try {
            preferences = conn.db(process.env.DB_BASE as string)
                .collection('preferences');
            PreferencesDAO.insertDefaults(defaults);
            preferences.createIndex(
                { module: 1 },
                { unique: true, name: 'module_1' }
            );
            Logger.debug('Preferences DAO started');
        } catch (e) {
            Logger.error('Preferences DAO error', e);
        }
    }
    /**
     * Izsniedz preferences vienam modulim
     * null, ja modulis nav atrasts
     * @param mod Moduļa nosaukums
     */
    static async getModulePreferences(mod: string): Promise<Preferences | null> {
        return (await preferences.findOne({ module: mod }, { projection: { _id: 0 } }));
    }
    /**
     * Nomaina vienam vai vairākiem moduļiem preferences
     * Preferences objektā jābūt norādītam modulim
     * Atgriež servera atbildi 
     * matchedCount	number	- Number of documents matched for update.
     * modifiedCount number	- Number of documents modified.
     * @param pref Preferences objekts vai objektu masīvs
     */
    static async updatePreferences(pref: Preferences | Preferences[]): Promise<BulkWriteOpResultObject | null> {
        if (!(pref instanceof Array)) {
            pref = [pref];
        }
        const update: BulkUpdateOne[] = [];
        pref.forEach(pr =>
            update.push({
                updateOne: {
                    filter: { module: pr.module },
                    update: { $set: flattenObject({settings: pr.settings}) }
                }
            })
        );
        Logger.debug('update preferences DAO', JSON.stringify(update));
        const updResult = await preferences.bulkWrite(update, { ordered: false });
        return updResult;
    }
    /**
     * Atiestata preferences uz noklusējuma vērtībām vienam modulim
     * @param mod Moduļa nosaukums
     */
    static async setDefaults(mod: string) {
        //        TODO 
    }

    private static async insertDefaults(def: Preferences[]) {
        const modules = await preferences.find({}, { projection: { module: 1 } }).toArray();
        const missing = def.filter(val => !modules.some(mod => mod.module === val.module));
        if (missing.length > 0) {
            await preferences.insertMany(missing);
        }
    }
}
