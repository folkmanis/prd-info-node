export function flattenObject(
  ob: { [key: string]: any },
  maxDepth = Infinity,
): { [key: string]: any } {
  if (maxDepth < 0 || Math.floor(maxDepth) !== maxDepth) {
    throw new Error('maxDepth should be positive integer value');
  }
  const toReturn: { [key: string]: any } = {};
  for (const i of Object.keys(ob)) {
    if (typeof ob[i] === 'object' && maxDepth > 0) {
      const flatObject = flattenObject(ob[i], maxDepth - 1);
      for (const k of Object.keys(flatObject)) {
        toReturn[i + '.' + k] = flatObject[k];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}
