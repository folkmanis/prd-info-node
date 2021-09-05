export function pick<T, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  return Object.assign(
    {},
    ...Object.entries(obj)
      .filter(([k]) => keys.filter((key) => key === k))
      .map(([k, v]) => ({ [k]: v })),
  );
}
