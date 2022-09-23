import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User } from '../entities/users';

export function assertCondition(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new InternalServerErrorException(msg);
    }
}

export function assertUser(user: User | undefined | null, message = 'Invalid username'): asserts user is User {
    if (!user) {
        throw new NotFoundException(message);
    }
}
