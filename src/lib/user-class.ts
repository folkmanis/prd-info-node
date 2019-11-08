import { Schema, Document } from 'mongoose';

export interface User extends Document {
    username: string,
    name: string,
    password: string,
    admin: boolean,
    last_login: Date,
}

export const UserSchema = new Schema<User>({
    username: String,
    name: String,
    password: String,
    admin: Boolean,
    last_login: Date,
})