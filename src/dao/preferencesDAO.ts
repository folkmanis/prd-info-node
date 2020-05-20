import { MongoClient, Collection, ObjectId, BulkWriteOpResultObject } from "mongodb";
import Logger from '../lib/logger';
import { SystemPreferences, Modules, SystemPreferenceModule, JobsSystemPreference, PreferencesResponse } from '../interfaces';
import { LogLevels } from '../lib/logger';
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

const defaults: SystemPreferences = [
    {
        module: 'kastes',
        settings: {
            colors: {
                yellow: 'hsl(45,75%,50%)',
                rose: 'hsl(315,75%,50%)',
                white: 'hsl(0,0%,50%)',
            }
        }
    },
    {
        module: 'system',
        settings: {
            menuExpandedByDefault: true,
            logLevels: [
                [LogLevels.DEBUG, 'Debug'],
                [LogLevels.ERROR, 'Error'],
                [LogLevels.INFO, 'Info'],
                [LogLevels.SILLY, 'Silly'],
                [LogLevels.VERBOSE, 'Verbose'],
                [LogLevels.WARN, 'Warning'],
            ]
        }
    },
    {
        module: 'jobs',
        settings: {
            productCategories: [
                {
                    category: 'plates',
                    description: 'Iespiedformas',
                }, {
                    category: 'perforated paper',
                    description: 'Perforētais papīrs',
                }
            ],
            lastJobId: 5001,
            lastInvoiceId: 1,
        }
    }
];

let preferences: Collection<SystemPreferenceModule>;

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
    static async getModulePreferences(mod: Modules): Promise<PreferencesResponse> {
        try {
            const resp = await preferences.findOne({ module: mod }, { projection: { _id: 0 } });
            return {
                error: !!resp ? false : 'Not found',
                data: resp || undefined,
            };

        } catch (error) { return { error }; }
    }
    /**
     * Izsniedz visu moduļu preferences
     */
    static async getAllPreferences(): Promise<PreferencesResponse> {
        //TODO tikai preferences, kuras attiecas uz lietotāju
        try {
            return {
                error: null,
                data: await preferences.find({}, { projection: { _id: 0 } }).toArray()
            };

        } catch (error) { return { error }; }
    }
    /**
     * Nomaina vienam vai vairākiem moduļiem preferences
     * Preferences objektā jābūt norādītam modulim
     * Atgriež servera atbildi 
     * matchedCount	number	- Number of documents matched for update.
     * modifiedCount number	- Number of documents modified.
     * @param pref Preferences objekts vai objektu masīvs
     */
    static async updatePreferences(...pref: SystemPreferenceModule[]): Promise<PreferencesResponse> {
        const update: BulkUpdateOne[] = [];
        pref.forEach(pr =>
            update.push({
                updateOne: {
                    filter: { module: pr.module },
                    update: { $set: flattenObject({ settings: pr.settings }) }
                }
            })
        );
        Logger.debug('update preferences DAO', JSON.stringify(update));
        try {
            const updResult = await preferences.bulkWrite(update, { ordered: false });
            return {
                error: false,
                modifiedCount: updResult.modifiedCount,
            };
        } catch (error) { return { error }; }
    }
    /**
     * Atiestata preferences uz noklusējuma vērtībām vienam modulim
     * @param mod Moduļa nosaukums
     */
    static async setDefaults(mod: Modules): Promise<PreferencesResponse> {
        const def = defaults.find(obj => obj.module === mod);
        if (!def) { return { error: 'Module not found' }; }
        try {
            const result = await preferences.updateOne({ module: mod }, { $set: { settings: def.settings } });
            return {
                error: !result.result.ok,
                modifiedCount: result.modifiedCount,
            };
        } catch (error) {
            return { error };
        }
    }

    private static async insertDefaults(def: SystemPreferenceModule[]) {
        const modules = await preferences.find({}, { projection: { module: 1 } }).toArray();
        const missing = def.filter(val => !modules.some(mod => mod.module === val.module));
        if (missing.length > 0) {
            await preferences.insertMany(missing);
        }
    }

    static async getNextJobId(): Promise<number> {
        const result = (await preferences.findOneAndUpdate({
            module: 'jobs',
        }, {
            $inc: { 'settings.lastJobId': 1 }
        }, {
            returnOriginal: false,
        })).value as any;
        return result.settings?.lastJobId;
    }

    static async getNextInvoiceId(): Promise<string> {
        const result = (await preferences.findOneAndUpdate({
            module: 'jobs',
        }, {
            $inc: { 'settings.lastInvoiceId': 1 }
        }, {
            returnOriginal: false,
        })).value?.settings as JobsSystemPreference;
        return result.lastInvoiceId.toString().padStart(5, '0');
    }
}
