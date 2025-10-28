/**
 * Represents a Some variant containing a value of type T.
 * @template T - The type of the contained value
 */
type Some<T> = {
  tag: "some";
  value: T;
};

/**
 * Represents a None variant with no value.
 */
type None = {
  tag: "none";
  value: undefined;
};

const NONE: None = { tag: "none", value: undefined };

/**
 * A type that represents an optional value inspired by Rust's Option<T>.
 * An Option can either be Some(value) containing a value, or None representing the absence of a value.
 * This provides a type-safe alternative to null/undefined.
 * 
 * @template T - The type of the value that may be present
 * 
 * @example
 * ```typescript
 * const someValue = Option.Some(42);
 * const noValue = Option.None<number>();
 * 
 * someValue.unwrap(); // 42
 * noValue.unwrapOr(0); // 0
 * ```
 */
export default class Option<T> {
  private constructor(private option: Some<T> | None) {}

  /**
   * Creates an Option containing a value.
   * 
   * @template T - The type of the value
   * @param value - The value to wrap in Some
   * @returns An Option containing the value
   * 
   * @example
   * ```typescript
   * const opt = Option.Some(42);
   * console.log(opt.unwrap()); // 42
   * ```
   */
  static Some<T>(value: T): Option<T> {
    return new Option<T>({ tag: "some", value });
  }

  /**
   * Creates an empty Option (None).
   * 
   * @template T - The type that would be contained if this were Some
   * @returns An empty Option
   * 
   * @example
   * ```typescript
   * const opt = Option.None<number>();
   * console.log(opt.isNone()); // true
   * ```
   */
  static None<T>(): Option<T> {
    return Option.NONE_INSTANCE as Option<T>;
  }

  private static readonly NONE_INSTANCE: Option<never> = new Option<never>(
    NONE
  );

  /**
   * Converts a value, undefined, null, or existing Option into an Option.
   * If the value is already an Option, returns it unchanged.
   * If the value is undefined or null, returns None.
   * Otherwise, wraps the value in Some.
   * 
   * @template T - The type of the value
   * @param value - The value to convert
   * @returns An Option containing the value or None
   * 
   * @example
   * ```typescript
   * Option.into(42); // Some(42)
   * Option.into(null); // None
   * Option.into(undefined); // None
   * Option.into(Option.Some(5)); // Some(5)
   * ```
   */
  static into<T>(value: T | undefined | null | Option<T>): Option<T> {
    if (value instanceof Option) {
      return value;
    }
    return value === undefined || value === null
      ? Option.None()
      : Option.Some(value);
  }

  /**
   * Gets the tag indicating whether this is Some or None.
   * 
   * @returns "some" if the Option contains a value, "none" otherwise
   */
  get tag(): "some" | "none" {
    return this.option.tag;
  }

  /**
   * Returns true if the Option contains a value.
   * 
   * @returns true if Some, false if None
   * 
   * @example
   * ```typescript
   * Option.Some(42).isSome(); // true
   * Option.None().isSome(); // false
   * ```
   */
  isSome(): boolean {
    return this.option.tag === "some";
  }

  /**
   * Returns true if the Option does not contain a value.
   * 
   * @returns true if None, false if Some
   * 
   * @example
   * ```typescript
   * Option.None().isNone(); // true
   * Option.Some(42).isNone(); // false
   * ```
   */
  isNone(): boolean {
    return this.option.tag === "none";
  }

  /**
   * Extracts the contained value.
   * 
   * @returns The contained value
   * @throws {Error} If the Option is None
   * 
   * @example
   * ```typescript
   * Option.Some(42).unwrap(); // 42
   * Option.None().unwrap(); // throws Error
   * ```
   */
  unwrap(): T {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        throw new Error("Called unwrap on a None value");
    }
  }

  /**
   * Returns the contained value or a provided default.
   * 
   * @param defaultValue - The value to return if None
   * @returns The contained value if Some, otherwise defaultValue
   * 
   * @example
   * ```typescript
   * Option.Some(42).unwrapOr(0); // 42
   * Option.None<number>().unwrapOr(0); // 0
   * ```
   */
  unwrapOr(defaultValue: T): T {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        return defaultValue;
    }
  }

  raw(): T | undefined {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        return undefined;
    }
  }

  /**
   * Returns the contained value or computes it from a function.
   * 
   * @param fn - Function to compute the default value if None
   * @returns The contained value if Some, otherwise the result of fn()
   * 
   * @example
   * ```typescript
   * Option.Some(42).unwrapOrElse(() => 0); // 42
   * Option.None<number>().unwrapOrElse(() => 0); // 0
   * ```
   */
  unwrapOrElse(fn: () => T): T {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        return fn();
    }
  }  

  /**
   * Extracts the contained value with a custom error message.
   * 
   * @param msg - The error message to use if None
   * @returns The contained value
   * @throws {Error} With the provided message if None
   * 
   * @example
   * ```typescript
   * Option.Some(42).expect("No value!"); // 42
   * Option.None().expect("No value!"); // throws Error("No value!")
   * ```
   */
  expect(msg: string): T {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        throw new Error(msg);
    }
  }

  /**
   * Maps an Option<T> to Option<U> by applying a function to the contained value.
   * 
   * @template U - The type of the mapped value
   * @param fn - Function to apply to the contained value
   * @returns Some with the transformed value if Some, otherwise None
   * 
   * @example
   * ```typescript
   * Option.Some(42).map(x => x * 2); // Some(84)
   * Option.None<number>().map(x => x * 2); // None
   * ```
   */
  map<U>(fn: (value: T) => U): Option<U> {
    switch (this.option.tag) {
      case "some":
        return Option.Some(fn(this.option.value));
      case "none":
        return Option.None<U>();
    }
  }

  /**
   * Maps an Option<T> to U by applying a function or returning a default value.
   * 
   * @template U - The type of the result
   * @param fn - Function to apply to the contained value
   * @param defaultValue - The value to return if None
   * @returns The transformed value if Some, otherwise defaultValue
   * 
   * @example
   * ```typescript
   * Option.Some(42).mapOr(x => x * 2, 0); // 84
   * Option.None<number>().mapOr(x => x * 2, 0); // 0
   * ```
   */
  mapOr<U>(fn: (value: T) => U, defaultValue: U): U {
    switch (this.option.tag) {
      case "some":
        return fn(this.option.value);
      case "none":
        return defaultValue;
    }
  }

  /**
   * Returns None if the Option is None, otherwise returns the other Option.
   * 
   * @template U - The type of the other Option
   * @param other - The Option to return if this is Some
   * @returns other if this is Some, otherwise None
   * 
   * @example
   * ```typescript
   * Option.Some(2).and(Option.Some("hello")); // Some("hello")
   * Option.None<number>().and(Option.Some("hello")); // None
   * ```
   */
  and<U>(other: Option<U>): Option<U> {
    switch (this.option.tag) {
      case "some":
        return other;
      case "none":
        return Option.None<U>();
    }
  }

  /**
   * Returns None if the Option is None, otherwise calls fn with the wrapped value.
   * Also known as flatMap in other languages.
   * 
   * @template U - The type of the Option returned by fn
   * @param fn - Function that returns an Option
   * @returns The result of fn if Some, otherwise None
   * 
   * @example
   * ```typescript
   * const sq = (x: number) => Option.Some(x * x);
   * Option.Some(2).andThen(sq); // Some(4)
   * Option.None<number>().andThen(sq); // None
   * ```
   */
  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    switch (this.option.tag) {
      case "some":
        return fn(this.option.value);
      case "none":
        return Option.None<U>();
    }
  }

  /**
   * Maps an Option<T> to U by applying a function or computing a default from a function.
   * 
   * @template U - The type of the result
   * @param fn - Function to apply to the contained value
   * @param defaultFn - Function to compute the default value if None
   * @returns The transformed value if Some, otherwise the result of defaultFn()
   * 
   * @example
   * ```typescript
   * Option.Some(42).mapOrElse(x => x * 2, () => 0); // 84
   * Option.None<number>().mapOrElse(x => x * 2, () => 0); // 0
   * ```
   */
  mapOrElse<U>(fn: (value: T) => U, defaultFn: () => U): U {
    switch (this.option.tag) {
      case "some":
        return fn(this.option.value);
      case "none":
        return defaultFn();
    }
  }

  /**
   * Pattern matches on the Option, executing the corresponding function.
   * 
   * @template U - The type of the result
   * @param cases - Object with Some and None handlers
   * @returns The result of the corresponding handler
   * 
   * @example
   * ```typescript
   * const result = Option.Some(42).match({
   *   Some: (value) => `Got ${value}`,
   *   None: () => "Got nothing"
   * }); // "Got 42"
   * ```
   */
  match<U>(cases: { Some: (value: T) => U; None: () => U }): U {
    switch (this.option.tag) {
      case "some":
        return cases.Some(this.option.value);
      case "none":
        return cases.None();
    }
  }

  /**
   * Executes a function if the Option contains a value.
   * Useful for side effects.
   * 
   * @param fn - Function to execute with the contained value
   * 
   * @example
   * ```typescript
   * Option.Some(42).ifSome(x => console.log(x)); // logs: 42
   * Option.None().ifSome(x => console.log(x)); // does nothing
   * ```
   */
  ifSome(fn: (value: T) => void): void {
    if (this.option.tag === "some") {
      fn(this.option.value);
    }
  }

  /**
   * Executes a function if the Option contains a value and satisfies a predicate.
   * Useful for conditional side effects.
   * @param predicate - Predicate function to test the contained value
   * @param fn - Function to execute with the contained value if predicate is true
   * @returns void
   */
  ifSomeWithPredicate(predicate: (value: T) => boolean, fn: (value: T) => void): void {
    if (this.option.tag === "some") {
      if (predicate(this.option.value)) {
        fn(this.option.value);
      }
    }
  }

  /**
   * Executes a function if the Option is None.
   * Useful for side effects.
   * 
   * @param fn - Function to execute if None
   * 
   * @example
   * ```typescript
   * Option.None().ifNone(() => console.log("empty")); // logs: "empty"
   * Option.Some(42).ifNone(() => console.log("empty")); // does nothing
   * ```
   */
  ifNone(fn: () => void): void {
    if (this.option.tag === "none") {
      fn();
    }
  }

  /**
   * Checks if this Option is equal to another Option.
   * Two Options are equal if both are None, or both are Some with equal values.
   * 
   * @param other - The Option to compare with
   * @returns true if the Options are equal, false otherwise
   * 
   * @example
   * ```typescript
   * Option.Some(42).equals(Option.Some(42)); // true
   * Option.Some(42).equals(Option.Some(43)); // false
   * Option.None().equals(Option.None()); // true
   * ```
   */
  equals(other: Option<T>): boolean {
    return this.match({
      Some: (value) => {
        return other.match({
          Some: (otherValue) => value === otherValue,
          None: () => false,
        });
      },
      None: () => other.isNone(),
    });
  }
}
