import ObjTree from 'objtree';

export interface Options {
  forceArray?: string[];
  stringFields?: string[];
}

export function xmlToJs<T = { [key: string]: any }>(
  xml: string,
  options: Options = {},
): T {
  const objTree = new ObjTree();
  objTree.force_array = options.forceArray || null;
  const obj = objTree.parseXML(xml);
  return clearObject<T>(obj, options.stringFields);
}

export function jsToXml(obj: { [key: string]: any }): string {
  const objTree = new ObjTree();
  obj = keyUpperFirstLetter(obj);
  const xml = objTree.writeXML(obj);
  return xml;
  // TODO
}

function clearObject<T>(
  obj: { [key: string]: any },
  stringFields: string[] = [],
): T {
  const entries = Object.entries(obj)
    .filter(([_, v]) => v !== undefined)
    .map(parseNumbers(stringFields))
    .map(parseBoolean)
    .map(keyLowerFirstLetter);
  return Object.assign(
    {},
    ...entries.map(([k, v]) => {
      if (v instanceof Array) {
        return { [k]: clearArray(v, k, stringFields) };
      }
      if (typeof v === 'object') {
        return { [k]: clearObject(v, stringFields) };
      }
      return { [k]: v };
    }),
  );
}

function clearArray<A>(
  obj: Array<A>,
  key = '',
  stringFields: string[] = [],
): Array<A> {
  return obj
    .map((v) => [key, v] as [string, any])
    .map(parseNumbers(stringFields))
    .map(parseBoolean)
    .map(([_, v]) => {
      if (v instanceof Array) {
        return clearArray(v, key, stringFields);
      }
      if (typeof v === 'object') {
        return clearObject(v, stringFields);
      }
      return v;
    });
}

function parseNumbers(
  ignore: string[],
): ([key, value]: [string, any]) => [string, any] {
  return ([key, value]) => {
    if (
      typeof value !== 'string' ||
      isNaN(+value) ||
      (typeof key === 'string' && ignore.includes(key))
    ) {
      return [key, value];
    } else {
      return [key, +value];
    }
  };
}

function keyLowerFirstLetter<T>([key, value]: [string, T]): [string, T] {
  return [key[0].toLowerCase() + key.substr(1), value];
}

function keyUpperFirstLetter(
  obj: { [key: string]: any } | any,
): { [key: string]: any } | any {
  if (obj instanceof Array) {
    return obj.map((val) => keyUpperFirstLetter(val));
  }
  if (typeof obj === 'object') {
    const entries: [string, any][] = Object.entries(obj).map(([key, value]) => {
      key = key[0].toUpperCase() + key.substr(1);
      return [key, keyUpperFirstLetter(value)];
    });
    return Object.assign({}, ...entries.map(([k, v]) => ({ [k]: v })));
  }
  return obj;
}

function parseBoolean<T extends string | number>([key, value]: [string, T]): [
  string,
  T | boolean,
] {
  if (value === 'false') {
    return [key, false];
  }
  if (value === 'true') {
    return [key, true];
  }
  return [key, value];
}
