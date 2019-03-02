import {Data} from "./contract";

export function modify<T, K extends keyof T>(instance: T, key: K, handler: (value: T[K]) => T[K]): T {
  return {...instance, [key]: handler(instance[key])};
}



export function const_<T>(value: T): () => T {
  return () => value;
}

export function isUint8Array(instance: any): instance is Uint8Array {
  return typeof instance == 'object' && instance instanceof Uint8Array;
}

export function isData(instance: any): instance is Data {
  return typeof instance == 'string' || isUint8Array(instance);
}

export function isIterable(instance: any): instance is Iterable<any> {
  return typeof instance == 'object' && Symbol.iterator in instance;
}

export function isAsyncIterable(instance: any): instance is AsyncIterable<any> {
  return typeof instance == 'object' && Symbol.asyncIterator in instance;
}

export function isPromiseLike(instance: any): instance is PromiseLike<any> {
  return typeof instance == 'object' && 'then' in instance;
}

// TODO: this is janky, but nice error messages are nice. Have a think about it
export function typeDescription(x: any): string {
  if (x === null)
    return 'null';

  let t = typeof x;
  if (t !== 'object') return t;

  const p = Object.getPrototypeOf(x);
  if (p !== Object.prototype)
    return p.constructor.name;

  return t
}

export async function toPromiseArray<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const value of iterable) result.push(value);
  return result;
}

export function runningInNode() {
  return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined');
}

