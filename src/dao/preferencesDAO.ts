import { MongoClient, Collection, ObjectId } from "mongodb";
import Logger from '../lib/logger';
import { Preferences } from '../lib/preferences-class';

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

    private static async insertDefaults(def: Preferences[]) {
        const modules = await preferences.find({}, { projection: { module: 1 } }).toArray();
        preferences.insertMany(
            def.filter(val => !modules.some(mod => mod.module === val.module))
        );
    }
}
