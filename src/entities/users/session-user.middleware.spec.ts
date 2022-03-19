import { SessionUserMiddleware } from './session-user.middleware';

describe('SessionUserMiddleware', () => {
  it('should be defined', () => {
    expect(new SessionUserMiddleware()).toBeDefined();
  });
});
