export function required<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

export function flat<T>(array: T[][]) {
  return array.reduce<T[]>((l, ll) => l.concat(ll), []);
}

export function flatMap<S, T>(
  array: S[],
  mapping: (item: S, index: number) => T[]
) {
  return flat(array.map(mapping));
}
