import { Ord } from "./ord";

export function sortByKey<T, K extends keyof T>(
  arr: T[],
  keyFn: (item: T) => T[K] | { get(): number } | Ord
): T[] {
  return [...arr].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    // If values have 'get' method (like YearImpl)
    if (aVal && typeof aVal === 'object' && 'get' in aVal && typeof aVal.get === 'function') {
      const aNum = aVal.get();
      const bNum = bVal && typeof bVal === 'object' && 'get' in bVal && typeof bVal.get === 'function' 
        ? bVal.get() 
        : Number(bVal);
      return aNum - bNum;
    }
    
    // Otherwise compare as numbers
    return Number(aVal) - Number(bVal);
  });
}
