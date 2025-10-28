import { Ord, OrderingImpl } from "./ord";


export function sort<T extends Ord<T>>(arr: T[], inPlace = false): T[] {
  const out = inPlace ? arr : arr.slice();
  out.sort((a: T, b: T) => {
    const ord = a.cmp(b);
    if (ord.isLess()) return -1;
    if (ord.isGreater()) return 1;
    return 0;
  });
  return out;
}

export function sortInPlace<T extends Ord<T>>(arr: T[]): T[] {
  return sort(arr, true);
}

export function sortBy<T>(arr: T[], compare: (a: T, b: T) => OrderingImpl, inPlace = false): T[] {
  const out = inPlace ? arr : arr.slice();
  out.sort((a: T, b: T) => {
    const ord = compare(a, b);
    if (ord.isLess()) return -1;
    if (ord.isGreater()) return 1;
    return 0;
  });
  return out;
}

export function sortByKey<T, K extends Ord<K>>(arr: T[], key: (v: T) => K, inPlace = false): T[] {
  return sortBy(arr, (a, b) => key(a).cmp(key(b)), inPlace);
}

export function min<T extends Ord<T>>(a: T, b: T): T {
  return a.cmp(b).isLess() ? a : b;
}

export function max<T extends Ord<T>>(a: T, b: T): T {
  return a.cmp(b).isGreater() ? a : b;
}
