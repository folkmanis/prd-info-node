import { ObjectId } from 'mongodb';

export interface JobsProductsTotals {
  _id: ObjectId;
  name: string;
  category: string;
  description: string;
  inactive: boolean | null;
  units: string;
  sum: number;
  count: number;
  total: number;
}
