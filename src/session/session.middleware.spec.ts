import { SessionMiddleware } from './session.middleware.js';

describe('SessionMiddleware', () => {
  it('should be defined', () => {
    expect(new SessionMiddleware()).toBeDefined();
  });
});
