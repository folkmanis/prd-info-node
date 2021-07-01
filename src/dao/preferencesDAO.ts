import { defaultsDeep } from 'lodash';
import { BulkWriteOperation, Collection, Db, MongoClient } from "mongodb";
import { Modules, PreferencesResponse, SystemPreferenceModule, SystemPreferences } from '../interfaces';
import { flattenObject } from '../lib/flatten-object';
import Logger, { LogLevels } from '../lib/logger';
import { Dao } from '../interfaces/dao.interface';

interface BulkUpdateOne {
    updateOne: {
        filter: { [key: string]: any; },
        update: {
            $set: { [key: string]: any; };
        },
        upsert?: boolean,
    };
}

const defaultPrefs: SystemPreferences = [
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
            jobStates: [
                {
                    state: 10,
                    description: 'Sagatavošana',
                },
                {
                    state: 20,
                    description: 'Ražošana',
                },
                {
                    state: 30,
                    description: 'Gatavs',
                },
                {
                    state: 50,
                    description: 'Izrakstīts',
                }
            ],
            productUnits: [],
        }
    },
    {
        module: 'paytraq',
        settings: { enabled: false }
    }
];


export class PreferencesDao extends Dao {

    preferences!: Collection<SystemPreferenceModule>;

    async injectDb(db: Db) {
        try {
            this.preferences = db.collection('preferences');
            this.insertDefaults(defaultPrefs);
            this.preferences.createIndex(
                { module: 1 },
                { unique: true, name: 'module_1' }
            );
        } catch (e) {
            Logger.error('Preferences DAO error', e);
        }
    }
    /**
     * Izsniedz preferences vienam modulim
     * null, ja modulis nav atrasts
     * @param mod Moduļa nosaukums
     */
    async getModulePreferences(mod: Modules): Promise<PreferencesResponse> {
        try {
            const resp = await this.preferences.findOne({ module: mod }, { projection: { _id: 0 } });
            return {
                error: !!resp ? false : 'Not found',
                data: resp || undefined,
            };

        } catch (error) { return { error }; }
    }
    /**
     * Izsniedz visu moduļu preferences
     */
    async getAllPreferences(): Promise<SystemPreferenceModule[]> {
        //TODO tikai preferences, kuras attiecas uz lietotāju
        return await this.preferences.find({}, { projection: { _id: 0 } }).toArray();
    }
    /**
     * Nomaina vienam vai vairākiem moduļiem preferences
     * Preferences objektā jābūt norādītam modulim
     * Atgriež servera atbildi 
     * matchedCount	number	- Number of documents matched for update.
     * modifiedCount number	- Number of documents modified.
     * @param pref Preferences objekts vai objektu masīvs
     */
    async updatePreferences(...pref: SystemPreferenceModule[]): Promise<PreferencesResponse> {
        const update: BulkUpdateOne[] = pref.map(pr => (
            {
                updateOne: {
                    filter: { module: pr.module },
                    update: { $set: flattenObject({ settings: pr.settings }, 1) }
                }
            }
        ));
        Logger.debug('update preferences DAO', JSON.stringify(update));
        try {
            const updResult = await this.preferences.bulkWrite(update, { ordered: false });
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
    async setDefaults(mod: Modules): Promise<PreferencesResponse> {
        const def = defaultPrefs.find(obj => obj.module === mod);
        if (!def) { return { error: 'Module not found' }; }
        try {
            const result = await this.preferences.updateOne({ module: mod }, { $set: { settings: def.settings } });
            return {
                error: !result.result.ok,
                modifiedCount: result.modifiedCount,
            };
        } catch (error) {
            return { error };
        }
    }

    private async insertDefaults(def: SystemPreferenceModule[]) {
        const modules = await this.preferences.find({}).toArray();
        const missing: BulkWriteOperation<SystemPreferenceModule>[] = [];
        for (const mod of def) {
            const modDb = modules.find(md => md.module === mod.module);
            if (modDb) {
                missing.push(
                    {
                        updateOne: {
                            filter: { module: modDb.module },
                            update: { $set: defaultsDeep(modDb, mod) },
                        }
                    }

                );
            } else {
                missing.push({ insertOne: { document: mod } });
            }
        }

        await this.preferences.bulkWrite(missing);
    }

}
