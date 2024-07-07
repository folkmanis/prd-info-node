import { NullResponseInterceptor } from './null-response.interceptor.js';

describe('NullResponseInterceptor', () => {
  it('should be defined', () => {
    expect(new NullResponseInterceptor()).toBeDefined();
  });
});
