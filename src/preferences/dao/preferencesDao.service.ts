import { Injectable } from '@nestjs/common';
import { flatten } from 'flat';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../database/database.service.js';
import { pickNotNull } from '../../lib/pick-not-null.js';
import {
  PreferencesDbModules,
  PreferencesModuleNames,
} from '../interfaces/system-preferences.interface.js';

interface BulkUpdateOne {
  updateOne: {
    filter: { [key: string]: any };
    update: {
      $set?: { [key: string]: any };
      $unset?: { [key: string]: any };
    };
    upsert?: boolean;
  };
}

@Injectable()
export class PreferencesDao {
  preferences: Collection<PreferencesDbModules>;

  constructor(private dbService: DatabaseService) {
    this.preferences = this.dbService.db().collection('preferences');

    this.createindexes();
  }

  async getAllPreferences<M extends PreferencesModuleNames>(
    filter: { module?: M } = {},
  ): Promise<PreferencesDbModules[]> {
    return this.preferences
      .find<PreferencesDbModules>(filter, { projection: { _id: 0 } })
      .toArray();
  }

  async updatePreferences(pref: PreferencesDbModules[]): Promise<number> {
    const operations: BulkUpdateOne[] = pref.map((pr) => {
      const updates = flatten(
        { settings: pr.settings },
        { safe: true },
      ) as Record<string, any>;
      const update: BulkUpdateOne = {
        updateOne: {
          filter: { module: pr.module },
          update: {},
        },
      };

      const $set = pickNotNull(updates);
      if (Object.keys($set).length > 0) {
        update.updateOne.update.$set = $set;
      }

      const $unset = Object.entries(updates)
        .filter(([_, v]) => v === null)
        .map(([k]) => [k, 1]);
      if ($unset.length > 0) {
        update.updateOne.update.$unset = Object.fromEntries($unset);
      }

      return update;
    });

    const { modifiedCount } = await this.preferences.bulkWrite(operations, {
      ordered: false,
    });
    return modifiedCount;
  }

  private createindexes() {
    this.preferences.createIndex(
      { module: 1 },
      { unique: true, name: 'module_1' },
    );
  }
}
