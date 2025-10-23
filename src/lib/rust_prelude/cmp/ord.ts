import Option from "@/lib/rust_prelude/option/Option";

/**
 * An `Ordering` is the result of a comparison between two values.
 * 
 * Mimics Rust's `std::cmp::Ordering`
 */
enum Ordering {
  Less = -1,
  Equal = 0,
  Greater = 1,
}

export class OrderingImpl {
  private constructor(private readonly value: Ordering) {}

  static of(value: Ordering): OrderingImpl {
    return new OrderingImpl(value);
  }

  match<T>(handlers: {
    Less: () => T
    Equal: () => T
    Greater: () => T
  }): T {
    switch (this.value) {
      case Ordering.Less:
        return handlers.Less()
      case Ordering.Equal:
        return handlers.Equal()
      case Ordering.Greater:
        return handlers.Greater()
      default: {
        const _exhaustive: never = this.value
        throw new Error(`Unhandled Ordering: ${_exhaustive}`)
      }
    }
  }

  isLess(): boolean {
    return this.value === Ordering.Less
  }

  isEqual(): boolean{
    return this.value === Ordering.Equal
  }

  isGreater(): boolean {
    return this.value === Ordering.Greater
  }

  static Less(): OrderingImpl {
    return OrderingImpl.of(Ordering.Less);
  }

  static Greater(): OrderingImpl {
    return OrderingImpl.of(Ordering.Greater);
  }

  static Equal(): OrderingImpl {
    return OrderingImpl.of(Ordering.Equal);
  }

  valueOf(): Ordering {
    return this.value
  }
}

/**
 * Reverses the `Ordering`.
 * 
 * - `Less` becomes `Greater`.
 * - `Greater` becomes `Less`.
 * - `Equal` becomes `Equal`.
 */
export function reverseOrdering(ordering: OrderingImpl): OrderingImpl {
  switch (ordering.valueOf()) {
    case Ordering.Less:
      return OrderingImpl.of(Ordering.Greater);
    case Ordering.Greater:
      return OrderingImpl.of(Ordering.Less);
    case Ordering.Equal:
      return OrderingImpl.of(Ordering.Equal);
  }
}

/**
 * Chains two orderings.
 * 
 * Returns `first` when it's not `Equal`. Otherwise returns `second`.
 */
export function thenOrdering(first: OrderingImpl, second: OrderingImpl): OrderingImpl {
  return !first.isEqual() ? first : second;
}

/**
 * Chains with another ordering computed from a function.
 * 
 * Returns `first` when it's not `Equal`. Otherwise returns the result of `f`.
 */
export function thenWithOrdering(first: OrderingImpl, f: () => OrderingImpl): OrderingImpl {
  return !first.isEqual() ? first : f();
}


/**
 * Trait for equality comparisons which are partial equivalence relations.
 * 
 * Mimics Rust's `std::cmp::PartialEq`
 */
export interface PartialEq<T = unknown> {
  /**
   * This method tests for `self` and `other` values to be equal.
   */
  eq(other: T): boolean;

  /**
   * This method tests for `!=`. The default implementation is almost always sufficient.
   */
  ne?(other: T): boolean;
}

/**
 * Trait for equality comparisons which are equivalence relations.
 * 
 * This means, in addition to `a == b` and `a != b` being strict inverses,
 * the equality must be (for all `a`, `b` and `c`):
 * 
 * - reflexive: `a == a`;
 * - symmetric: `a == b` implies `b == a`; and
 * - transitive: `a == b` and `b == c` implies `a == c`.
 * 
 * Mimics Rust's `std::cmp::Eq`
 */
export interface Eq<T = unknown> extends PartialEq<T> {
  eq(other: T): boolean;
}

/**
 * Trait for values that can be compared for a sort-order.
 * 
 * The comparison must satisfy, for all `a`, `b` and `c`:
 * 
 * - antisymmetry: if `a < b` then `!(a > b)`, as well as `a > b` implying `!(a < b)`; and
 * - transitivity: `a < b` and `b < c` implies `a < c`. The same must hold for both `==` and `>`.
 * 
 * Mimics Rust's `std::cmp::PartialOrd`
 */
export interface PartialOrd<T = unknown> extends PartialEq<T> {
  /**
   * This method returns an ordering between `self` and `other` values if one exists.
   */
  partialCmp(other: T): Option<OrderingImpl>;

  /**
   * This method tests less than (for `self` and `other`) and is used by the `<` operator.
   */
  lt?(other: T): boolean;

  /**
   * This method tests less than or equal to (for `self` and `other`) and is used by the `<=` operator.
   */
  le?(other: T): boolean;

  /**
   * This method tests greater than (for `self` and `other`) and is used by the `>` operator.
   */
  gt?(other: T): boolean;

  /**
   * This method tests greater than or equal to (for `self` and `other`) and is used by the `>=` operator.
   */
  ge?(other: T): boolean;
}

/**
 * Trait for types that form a total order.
 * 
 * An order is a total order if it is (for all `a`, `b` and `c`):
 * 
 * - total and antisymmetric: exactly one of `a < b`, `a == b` or `a > b` is true; and
 * - transitive, `a < b` and `b < c` implies `a < c`. The same must hold for both `==` and `>`.
 * 
 * Mimics Rust's `std::cmp::Ord`
 */
export interface Ord<T = unknown> extends Eq<T>, PartialOrd<T> {
  /**
   * This method returns an `Ordering` between `self` and `other`.
   * 
   * By convention, `self.cmp(other)` returns the ordering matching the expression
   * `self <operator> other` if true.
   */
  cmp(other: T): OrderingImpl;

  /**
   * Compares and returns the maximum of two values.
   * 
   * Returns the second argument if the comparison determines them to be equal.
   */
  max?(other: T): T;

  /**
   * Compares and returns the minimum of two values.
   * 
   * Returns the first argument if the comparison determines them to be equal.
   */
  min?(other: T): T;

  /**
   * Restrict a value to a certain interval.
   * 
   * Returns `max` if `self` is greater than `max`, and `min` if `self` is less than `min`.
   * Otherwise this returns `self`.
   * 
   * Panics if `min > max`.
   */
  clamp?(min: T, max: T): T;
}

/**
 * Compares and returns the maximum of two values.
 * 
 * Returns the second argument if the comparison determines them to be equal.
 */
export function max<T>(v1: T & Ord<T>, v2: T & Ord<T>): T {
  return v1.cmp(v2).isGreater() ? v1 : v2;
}

/**
 * Compares and returns the minimum of two values.
 * 
 * Returns the first argument if the comparison determines them to be equal.
 */
export function min<T>(v1: T & Ord<T>, v2: T & Ord<T>): T {
  return v1.cmp(v2).isLess() ? v1 : v2;
}

/**
 * Compares and returns the maximum of two values with respect to the specified comparison function.
 */
export function maxBy<T>(v1: T, v2: T, compare: (a: T, b: T) => OrderingImpl): T {
  return compare(v1, v2).isGreater() ? v1 : v2;
}

/**
 * Compares and returns the minimum of two values with respect to the specified comparison function.
 */
export function minBy<T>(v1: T, v2: T, compare: (a: T, b: T) => OrderingImpl): T {
  return compare(v1, v2).isLess() ? v1 : v2;
}

/**
 * Returns the maximum of two values with respect to the specified key function.
 */
export function maxByKey<T, K>(
  v1: T,
  v2: T,
  f: (v: T) => K & Ord<K>
): T {
  return f(v1).cmp(f(v2)).isGreater() ? v1 : v2;
}

/**
 * Returns the minimum of two values with respect to the specified key function.
 */
export function minByKey<T, K>(
  v1: T,
  v2: T,
  f: (v: T) => K & Ord<K>
): T {
  return f(v1).cmp(f(v2)).isLess() ? v1 : v2;
}

/**
 * Helper function to create a default `ne` implementation from `eq`.
 */
export function defaultNe<T>(self: T, other: T, eq: (a: T, b: T) => boolean): boolean {
  return !eq(self, other);
}

/**
 * Helper function to create default `lt` implementation for `PartialOrd`.
 */
export function partialOrdLt<T>(
  self: T,
  other: T,
  partialCmp: (a: T, b: T) => Option<OrderingImpl>
): boolean {
  return partialCmp(self, other)
    .map((ord) => ord.isLess())
    .unwrapOr(false);
}

/**
 * Helper function to create default `le` implementation for `PartialOrd`.
 */
export function partialOrdLe<T>(
  self: T,
  other: T,
  partialCmp: (a: T, b: T) => Option<OrderingImpl>
): boolean {
  return partialCmp(self, other)
    .map((ord) => !ord.isGreater())
    .unwrapOr(false);
}

/**
 * Helper function to create default `gt` implementation for `PartialOrd`.
 */
export function partialOrdGt<T>(
  self: T,
  other: T,
  partialCmp: (a: T, b: T) => Option<OrderingImpl>
): boolean {
  return partialCmp(self, other)
    .map((ord) => ord.isGreater())
    .unwrapOr(false);
}

/**
 * Helper function to create default `ge` implementation for `PartialOrd`.
 */
export function partialOrdGe<T>(
  self: T,
  other: T,
  partialCmp: (a: T, b: T) => Option<OrderingImpl>
): boolean {
  return partialCmp(self, other)
    .map((ord) => !ord.isLess())
    .unwrapOr(false);
}

/**
 * Helper function to create default `max` implementation for `Ord`.
 */
export function ordMax<T>(self: T, other: T, cmp: (a: T, b: T) => OrderingImpl): T {
  return cmp(self, other).isGreater() ? self : other;
}

/**
 * Helper function to create default `min` implementation for `Ord`.
 */
export function ordMin<T>(self: T, other: T, cmp: (a: T, b: T) => OrderingImpl): T {
  return cmp(self, other).isLess() ? self : other;
}

/**
 * Helper function to create default `clamp` implementation for `Ord`.
 * 
 * Restricts a value to a certain interval.
 * Returns `max` if `self` is greater than `max`, and `min` if `self` is less than `min`.
 * Otherwise returns `self`.
 * 
 * Panics if `min > max`.
 */
export function ordClamp<T>(
  self: T,
  min: T,
  max: T,
  cmp: (a: T, b: T) => OrderingImpl
): T {
  // if min > max -> error
  if (cmp(min, max).isGreater()) {
    throw new Error("min cannot be greater than max in clamp");
  }
  if (cmp(self, min).isLess()) {
    return min;
  }
  if (cmp(self, max).isGreater()) {
    return max;
  }
  return self;
}

// ============================================================================
// Decorators for implementing traits
// ============================================================================

/**
 * Implements default `ne` method based on `eq`.
 * 
 * @example
 * ```typescript
 * class Point implements PartialEq<Point> {
 *   constructor(public x: number, public y: number) {}
 *   
 *   eq(other: Point): boolean {
 *     return this.x === other.x && this.y === other.y;
 *   }
 *   
 *   @ImplNe
 *   ne(other: Point): boolean {
 *     return !this.eq(other);
 *   }
 * }
 * ```
 */
export function ImplNe<T>(
  target: PartialEq<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: PartialEq<T>, other: T): boolean {
    return !this.eq(other);
  };
  return descriptor;
}

/**
 * Implements default comparison methods (`lt`, `le`, `gt`, `ge`) based on `partialCmp`.
 * 
 * @example
 * ```typescript
 * class Score implements PartialOrd<Score> {
 *   constructor(public value: number) {}
 *   
 *   eq(other: Score): boolean {
 *     return this.value === other.value;
 *   }
 *   
 *   partialCmp(other: Score): Option<Ordering> {
 *     if (this.value < other.value) return Option.Some(Ordering.Less);
 *     if (this.value > other.value) return Option.Some(Ordering.Greater);
 *     return Option.Some(Ordering.Equal);
 *   }
 *   
 *   @ImplPartialOrdLt
 *   lt(other: Score): boolean { return false; }
 *   
 *   @ImplPartialOrdLe
 *   le(other: Score): boolean { return false; }
 *   
 *   @ImplPartialOrdGt
 *   gt(other: Score): boolean { return false; }
 *   
 *   @ImplPartialOrdGe
 *   ge(other: Score): boolean { return false; }
 * }
 * ```
 */
export function ImplPartialOrdLt<T>(
  target: PartialOrd<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: PartialOrd<T>, other: T): boolean {
    return this.partialCmp(other)
      .map((ord) => ord.isLess())
      .unwrapOr(false);
  };
  return descriptor;
}

export function ImplPartialOrdLe<T>(
  target: PartialOrd<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: PartialOrd<T>, other: T): boolean {
    return this.partialCmp(other)
      .map((ord) => !ord.isGreater())
      .unwrapOr(false);
  };
  return descriptor;
}

export function ImplPartialOrdGt<T>(
  target: PartialOrd<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: PartialOrd<T>, other: T): boolean {
    return this.partialCmp(other)
      .map((ord) => ord.isGreater())
      .unwrapOr(false);
  };
  return descriptor;
}

export function ImplPartialOrdGe<T>(
  target: PartialOrd<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: PartialOrd<T>, other: T): boolean {
    return this.partialCmp(other)
      .map((ord) => !ord.isLess())
      .unwrapOr(false);
  };
  return descriptor;
}

/**
 * Implements default `partialCmp` method based on `cmp` for `Ord` types.
 * 
 * @example
 * ```typescript
 * class Version implements Ord<Version> {
 *   constructor(public major: number, public minor: number) {}
 *   
 *   eq(other: Version): boolean {
 *     return this.major === other.major && this.minor === other.minor;
 *   }
 *   
 *   cmp(other: Version): Ordering {
 *     if (this.major !== other.major) {
 *       return this.major < other.major ? Ordering.Less : Ordering.Greater;
 *     }
 *     if (this.minor !== other.minor) {
 *       return this.minor < other.minor ? Ordering.Less : Ordering.Greater;
 *     }
 *     return Ordering.Equal;
 *   }
 *   
 *   @ImplPartialCmp
 *   partialCmp(other: Version): Option<Ordering> {
 *     return Option.None();
 *   }
 * }
 * ```
 */
export function ImplPartialCmp<T>(
  target: Ord<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: Ord<T>, other: T): Option<OrderingImpl> {
    return Option.Some(this.cmp(other));
  };
  return descriptor;
}

/**
 * Implements default `max` method based on `cmp`.
 */
export function ImplOrdMax<T>(
  target: Ord<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: Ord<T>, other: T): T {
    return this.cmp(other).isGreater() ? (this as unknown as T) : other;
  };
  return descriptor;
}

/**
 * Implements default `min` method based on `cmp`.
 */
export function ImplOrdMin<T>(
  target: Ord<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: Ord<T>, other: T): T {
    return this.cmp(other).isLess() ? (this as unknown as T) : other;
  };
  return descriptor;
}

/**
 * Implements default `clamp` method based on `cmp`.
 */
export function ImplOrdClamp<T>(
  target: Ord<T>,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.value = function (this: Ord<T>, min: T, max: T): T {
    const self = this as unknown as T;
    if (this.cmp(min).isGreater() && this.cmp(max).isGreater()) {
      throw new Error("min cannot be greater than max in clamp");
    }
    if (this.cmp(min).isLess()) {
      return min;
    }
    if (this.cmp(max).isGreater()) {
      return max;
    }
    return self;
  };
  return descriptor;
}

/**
 * Class decorator that automatically implements all optional trait methods.
 * 
 * Requires the class to implement the core required methods (`eq` for PartialEq,
 * `partialCmp` for PartialOrd, or `cmp` for Ord).
 * 
 * @example
 * ```typescript
 * @DeriveOrd
 * class Point implements Ord<Point> {
 *   constructor(public x: number, public y: number) {}
 *   
 *   eq(other: Point): boolean {
 *     return this.x === other.x && this.y === other.y;
 *   }
 *   
 *   cmp(other: Point): Ordering {
 *     if (this.x !== other.x) {
 *       return this.x < other.x ? Ordering.Less : Ordering.Greater;
 *     }
 *     if (this.y !== other.y) {
 *       return this.y < other.y ? Ordering.Less : Ordering.Greater;
 *     }
 *     return Ordering.Equal;
 *   }
 *   
 *   // All other methods (partialCmp, lt, le, gt, ge, max, min, clamp) are auto-generated
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DeriveOrd<T extends new (...args: any[]) => Ord<any>>(
  constructor: T
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proto = constructor.prototype as any;

  // Implement partialCmp from cmp
  if (!proto.partialCmp) {
    proto.partialCmp = function (other: unknown): Option<OrderingImpl> {
      return Option.Some(this.cmp(other));
    };
  }

  // Implement ne from eq
  if (!proto.ne) {
    proto.ne = function (other: unknown): boolean {
      return !this.eq(other);
    };
  }

  // Implement lt, le, gt, ge from partialCmp
  if (!proto.lt) {
    proto.lt = function (other: unknown): boolean {
      return this.partialCmp(other)
        .map((ord: OrderingImpl) => ord.isLess())
        .unwrapOr(false);
    };
  }

  if (!proto.le) {
    proto.le = function (other: unknown): boolean {
      return this.partialCmp(other)
        .map((ord: OrderingImpl) => !ord.isGreater())
        .unwrapOr(false);
    };
  }

  if (!proto.gt) {
    proto.gt = function (other: unknown): boolean {
      return this.partialCmp(other)
        .map((ord: OrderingImpl) => ord.isGreater())
        .unwrapOr(false);
    };
  }

  if (!proto.ge) {
    proto.ge = function (other: unknown): boolean {
      return this.partialCmp(other)
        .map((ord: OrderingImpl) => !ord.isLess())
        .unwrapOr(false);
    };
  }

  // Implement max, min, clamp from cmp
  if (!proto.max) {
    proto.max = function (other: unknown): unknown {
      return this.cmp(other).isGreater() ? this : other;
    };
  }

  if (!proto.min) {
    proto.min = function (other: unknown): unknown {
      return this.cmp(other).isLess() ? this : other;
    };
  }

  if (!proto.clamp) {
    proto.clamp = function (min: unknown, max: unknown): unknown {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((min as any).cmp && (min as any).cmp(max) === Ordering.Greater) {
        throw new Error("min cannot be greater than max in clamp");
      }
      if (this.cmp(min) === Ordering.Less) {
        return min;
      }
      if (this.cmp(max) === Ordering.Greater) {
        return max;
      }
      return this;
    };
  }

  return constructor;
}

/**
 * Class decorator for automatically implementing PartialOrd trait methods.
 * 
 * @example
 * ```typescript
 * @DerivePartialOrd
 * class Score implements PartialOrd<Score> {
 *   constructor(public value: number) {}
 *   
 *   eq(other: Score): boolean {
 *     return this.value === other.value;
 *   }
 *   
 *   partialCmp(other: Score): Option<Ordering> {
 *     if (this.value < other.value) return Option.Some(Ordering.Less);
 *     if (this.value > other.value) return Option.Some(Ordering.Greater);
 *     return Option.Some(Ordering.Equal);
 *   }
 *   
 *   // lt, le, gt, ge, ne are auto-generated
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DerivePartialOrd<T extends new (...args: any[]) => PartialOrd<any>>(
  constructor: T
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proto = constructor.prototype as any;

  if (!proto.ne) {
    proto.ne = function (other: unknown): boolean {
      return !this.eq(other);
    };
  }

  if (!proto.lt) {
    proto.lt = function (other: unknown): boolean {
      return this.partialCmp(other)
        .map((ord: OrderingImpl) => ord.isLess())
        .unwrapOr(false);
    };
  }

  if (!proto.le) {
    proto.le = function (other: unknown): boolean {
      return this.partialCmp(other)
        .map((ord: OrderingImpl) => !ord.isGreater())
        .unwrapOr(false);
    };
  }

  if (!proto.gt) {
    proto.gt = function (other: unknown): boolean {
      return this.partialCmp(other)
        .map((ord: OrderingImpl) => ord.isGreater())
        .unwrapOr(false);
    };
  }

  if (!proto.ge) {
    proto.ge = function (other: unknown): boolean {
      return this.partialCmp(other)
        .map((ord: OrderingImpl) => !ord.isLess())
        .unwrapOr(false);
    };
  }

  return constructor;
}

/**
 * Class decorator for automatically implementing PartialEq trait methods.
 * 
 * @example
 * ```typescript
 * @DerivePartialEq
 * class Person implements PartialEq<Person> {
 *   constructor(public name: string, public age: number) {}
 *   
 *   eq(other: Person): boolean {
 *     return this.name === other.name && this.age === other.age;
 *   }
 *   
 *   // ne is auto-generated
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DerivePartialEq<T extends new (...args: any[]) => PartialEq<any>>(
  constructor: T
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proto = constructor.prototype as any;

  if (!proto.ne) {
    proto.ne = function (other: unknown): boolean {
      return !this.eq(other);
    };
  }

  return constructor;
}

