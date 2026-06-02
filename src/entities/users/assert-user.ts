import { assertIsFound } from '../../lib/assertions.js';
import { User } from './entities/user.interface.js';

export function assertUser(
  user: User | undefined | null,
  message = 'Invalid username',
): asserts user is User {
  assertIsFound(user, message);
}
