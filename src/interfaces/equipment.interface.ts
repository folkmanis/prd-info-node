import { ObjectId } from 'mongodb';

export interface Equipment {
  _id: ObjectId;
  name: string;
  description?: string;
}
