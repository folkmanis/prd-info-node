import { Injectable } from '@nestjs/common';
import { defaultsDeep } from 'lodash-es';
import { AnyBulkWriteOperation, Collection } from 'mongodb';
import { DatabaseService } from '../../database/database.service.js';
import { SystemModules } from '../interfaces/system-modules.interface.js';
import {
  SystemPreferenceModule,
  SystemPreference,
} from '../interfaces/system-preferences.interface.js';
import { DEFAULT_PREFERENCES } from './default-preferences.js';
import { flatten } from 'flat';

interface BulkUpdateOne {
  updateOne: {
    filter: { [key: string]: any };
    update: {
      $set: { [key: string]: any };
    };
    upsert?: boolean;
  };
}

@Injectable()
export class PreferencesDao {
  preferences: Collection<SystemPreferenceModule>;

  constructor(private dbService: DatabaseService) {
    this.preferences = this.dbService.db().collection('preferences');

    this.createindexes();
    this.insertDefaults(DEFAULT_PREFERENCES);
  }

  async getModulePreferences(mod: SystemModules): Promise<SystemPreference> {
    const resp = await this.preferences.findOne(
      { module: mod },
      { projection: { _id: 0 } },
    );
    if (!resp) {
      throw `System preferences for module ${mod} missing`;
    }
    return resp.settings;
  }

  async getAllPreferences(): Promise<SystemPreferenceModule[]> {
    return await this.preferences
      .find({}, { projection: { _id: 0 } })
      .toArray();
  }

  async updatePreferences(...pref: SystemPreferenceModule[]): Promise<number> {
    const update: BulkUpdateOne[] = pref.map((pr) => ({
      updateOne: {
        filter: { module: pr.module },
        update: {
          $set: flatten({ settings: pr.settings }, { safe: true }),
        },
      },
    }));

    const { modifiedCount } = await this.preferences.bulkWrite(update, {
      ordered: false,
    });
    return modifiedCount || 0;
  }
  /**
   * Atiestata preferences uz noklusējuma vērtībām vienam modulim
   * @param mod Moduļa nosaukums
   */
  async setDefaults(module: SystemModules): Promise<number> {
    const def = DEFAULT_PREFERENCES.find((obj) => obj.module === module);
    if (!def) {
      throw 'Module not found';
    }

    const { modifiedCount } = await this.preferences.updateOne(
      { module },
      { $set: { settings: def.settings } },
    );
    return modifiedCount;
  }

  private async insertDefaults(def: SystemPreferenceModule[]) {
    const modules = await this.preferences.find({}).toArray();
    const missing: AnyBulkWriteOperation<SystemPreferenceModule>[] = [];
    for (const mod of def) {
      const modDb = modules.find((md) => md.module === mod.module);
      if (modDb) {
        missing.push({
          updateOne: {
            filter: { module: modDb.module },
            update: { $set: defaultsDeep(modDb, mod) },
          },
        });
      } else {
        missing.push({ insertOne: { document: mod } });
      }
    }

    await this.preferences.bulkWrite(missing);
  }

  private createindexes() {
    this.preferences.createIndex(
      { module: 1 },
      { unique: true, name: 'module_1' },
    );
  }
}
