import { flattenObject } from './flatten-object';

const obj = {
  settings: {
    productCategories: [
      {
        category: 'plates',
        description: 'Iespiedforma',
      },
    ],
    lastJobId: 5001,
  },
};

const resultOneLevel = {
  'settings.productCategories': [
    {
      category: 'plates',
      description: 'Iespiedforma',
    },
  ],
  'settings.lastJobId': 5001,
};

const resultTwoLevel = {
  'settings.productCategories.0': {
    category: 'plates',
    description: 'Iespiedforma',
  },
  'settings.lastJobId': 5001,
};

const resultFull = {
  'settings.productCategories.0.category': 'plates',
  'settings.productCategories.0.description': 'Iespiedforma',
  'settings.lastJobId': 5001,
};

describe('Should flatten object n deep', () => {
  test('flatten one level', () =>
    expect(flattenObject(obj, 1)).toEqual(resultOneLevel));
  test('flatten two level', () =>
    expect(flattenObject(obj, 2)).toEqual(resultTwoLevel));
  test('flatten full deep without second argument', () => {
    expect(flattenObject(obj)).toEqual(resultFull);
  });
  test('Should throw error when deep is not integer >0', () => {
    expect(() => flattenObject(obj, -1)).toThrow(
      'maxDepth should be positive integer value',
    );
  });
  test('Should throw error when no object provided', () => {
    expect(() => flattenObject(obj, 'string' as unknown as number)).toThrow();
    expect(() => flattenObject(obj, null as unknown as number)).toThrow();
    expect(() => flattenObject(obj, (() => {}) as unknown as number)).toThrow();
  });
  test('Should return empty object from empty object', () => {
    expect(flattenObject({})).toEqual({});
  });
});
