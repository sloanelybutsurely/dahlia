import { query } from '../src';

describe('query', () => {
  it('is defined', () => {
    expect(query).toBeDefined();
  });
  it('is a function', () => {
    expect(query).toBeInstanceOf(Function);
  });
});
