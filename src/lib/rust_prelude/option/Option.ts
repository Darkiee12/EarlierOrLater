export type Some<T> = {
  tag: "some";
  value: T;
};

export type None = {
  tag: "none";
  value: undefined;
};

const NONE: None = { tag: "none", value: undefined };


export default class Option<T> {
  private constructor(private option: Some<T> | None) {}


  static Some<T>(value: T): Option<T> {
    return new Option<T>({ tag: "some", value });
  }

  static None<T>(): Option<T> {
    return Option.NONE_INSTANCE as Option<T>;
  }

  private static readonly NONE_INSTANCE: Option<never> = new Option<never>(NONE);

  static into<T>(value: T | undefined | null): Option<T> {
    return value === undefined || value === null ? Option.None() : Option.Some(value);
  }

  get tag(): "some" | "none" {
    return this.option.tag;
  }


  isSome(): boolean {
    return this.option.tag === "some";
  }

  isNone(): boolean {
    return this.option.tag === "none";
  }

  unwrap(): T {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        throw new Error("Called unwrap on a None value");
    }
  }

  unwrapOr(defaultValue: T): T {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        return defaultValue;
    }
  }

  unwrapOrElse(fn: () => T): T {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        return fn();
    }
  }

  expect(msg: string): T {
    switch (this.option.tag) {
      case "some":
        return this.option.value;
      case "none":
        throw new Error(msg);
    }
  }

  map<U>(fn: (value: T) => U): Option<U> {
    switch (this.option.tag) {
      case "some":
        return Option.Some(fn(this.option.value));
      case "none":
        return Option.None<U>();
    }
  }

  mapOr<U>(fn: (value: T) => U, defaultValue: U): U {
    switch (this.option.tag) {
      case "some":
        return fn(this.option.value);
      case "none":
        return defaultValue;
    }
  }

  and<U>(other: Option<U>): Option<U> {
    switch (this.option.tag) {
      case "some":
        return other;
      case "none":
        return Option.None<U>();
    } 
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    switch (this.option.tag) {
      case "some":
        return fn(this.option.value);
      case "none":
        return Option.None<U>();
    }
  }

  mapOrElse<U>(fn: (value: T) => U, defaultFn: () => U): U {
    switch (this.option.tag) {
      case "some":
        return fn(this.option.value);
      case "none":
        return defaultFn();
    }
  }

  match<U>(cases: { Some: (value: T) => U; None: () => U }): U {
    switch (this.option.tag) {
      case "some":
        return cases.Some(this.option.value);
      case "none":
        return cases.None();
    }
  }

  ifSome(fn: (value: T) => void): void {
    if (this.option.tag === "some") {
      fn(this.option.value);
    }
  }

  ifNone(fn: () => void): void {
    if (this.option.tag === "none") {
      fn();
    } 
  }

  equals(other: Option<T>): boolean {
    return this.match({
      Some: (value) => {
        return other.match({
          Some: (otherValue) => value === otherValue,
          None: () => false
        })
      },
      None: () => other.isNone()
    })
  }
}
