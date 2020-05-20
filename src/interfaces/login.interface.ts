import { ResponseBase } from './response-base.interface';
import { User } from './user.interface';

export interface Login {
    username: string;
    password: string;
}

export interface LoginResponse extends ResponseBase<User> {
data: User | undefined;
}
