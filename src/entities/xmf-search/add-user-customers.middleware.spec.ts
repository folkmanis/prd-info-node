import { AddUserCustomersMiddleware } from './add-user-customers.middleware';

describe('AddUserCustomersMiddleware', () => {
  it('should be defined', () => {
    expect(new AddUserCustomersMiddleware()).toBeDefined();
  });
});
