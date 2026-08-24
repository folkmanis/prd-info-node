import { z } from 'zod';
import { pickNotNull } from './pick-not-null.js';

type SetOperations = { $set: Record<string, any> };
type UnsetOperations = { $unset: Record<string, any> };
type UpdateOperations = SetOperations | UnsetOperations;

export const updateOperatorsTransform = z.transform<
  Record<string, any>,
  UpdateOperations[]
>((value, ctx) => {
  const update: UpdateOperations[] = [];

  const setOperations = pickNotNull(value);
  if (Object.keys(setOperations).length > 0) {
    update.push({ $set: setOperations });
  }
  const unsetOperations = Object.entries(value)
    .filter(([_, v]) => v === null)
    .map(([k]) => k);
  if (unsetOperations.length > 0) {
    update.push({ $unset: unsetOperations });
  }

  if (update.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: `Empty update`,
      input: value,
    });
    return z.NEVER;
  }
  return update;
});
