import { Inject, Injectable } from '@nestjs/common';
import { flatten } from 'flat';
import { Collection } from 'mongodb';
import { pickNotNull } from '../../lib/pick-not-null.js';
import {
  PreferencesDbModules,
  PreferencesModuleNames,
} from '../interfaces/system-preferences.interface.js';
import { PREFERENCES_COLLECTION } from './preferences-collection.provider.js';

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
  constructor(
    @Inject(PREFERENCES_COLLECTION)
    private preferences: Collection<PreferencesDbModules>,
  ) {}

  async getAllPreferences<M extends PreferencesModuleNames>(
    filter: { module?: M } = {},
  ): Promise<PreferencesDbModules[]> {
    return this.preferences
      .find<PreferencesDbModules>(filter, { projection: { _id: 0 } })
      .toArray();
  }

  async updatePreferences(pref: PreferencesDbModules[]): Promise<number> {
    const operations: BulkUpdateOne[] = pref.map((pr) => {
      const update: BulkUpdateOne = {
        updateOne: {
          filter: { module: pr.module },
          update: {},
        },
      };

      const updates = flatten({ settings: pr.settings }, { safe: true });
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
}
