import { ObjectId } from 'mongodb';
import { ResponseBase } from './response-base.interface';

export const COLORS = ['yellow', 'rose', 'white'] as const;

export type Colors = typeof COLORS[number];

export type VeikalsBox = Record<Colors, number> & {
  total: number;
  gatavs: boolean;
  uzlime: boolean;
};

export interface Veikals {
  _id: ObjectId;
  kods: number | string;
  adrese: string;
  pasutijums: number;
  kastes: VeikalsBox[];
  lastModified: Date;
  kaste?: number;
}

export interface KastesResponse extends ResponseBase {
  apjomi?: number[];
  userPreferences?: { [key: string]: any };
}
