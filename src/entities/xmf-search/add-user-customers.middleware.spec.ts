import { AddUserCustomersMiddleware } from './add-user-customers.middleware.js';

describe('AddUserCustomersMiddleware', () => {
  it('should be defined', () => {
    expect(new AddUserCustomersMiddleware()).toBeDefined();
  });
});
