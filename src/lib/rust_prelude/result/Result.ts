export type Ok<T> = {
  tag: "ok";
  value: T;
};

export type Err<E> = {
  tag: "err";
  value: E;
};

type ResultTag = Ok<unknown>["tag"] | Err<unknown>["tag"];

export default class Result<T, E> {
  private constructor(private result: Ok<T> | Err<E>) {}
  static Ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>({ tag: "ok", value });
  }

  static Err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>({ tag: "err", value: error });
  }

  static fromTryCatch<T, E extends Error>(fn: T | (() => T)): Result<T, E> {
    try {
      const value = typeof fn === "function" ? (fn as () => T)() : fn;
      return Result.Ok<T, E>(value);
    } catch (e) {
      if (e instanceof Error) {
        return Result.Err(e as E);
      }
      throw e;
    }
  }

  static async fromPromise<T, E = unknown>(
    promiseOrFn: Promise<T> | (() => Promise<T>),
    mapErr?: (err: unknown) => E
  ): Promise<Result<T, E>> {
    try {
      const value =
        typeof promiseOrFn === "function"
          ? await (promiseOrFn as () => Promise<T>)()
          : await promiseOrFn;
      return Result.Ok<T, E>(value);
    } catch (err) {
      const e = mapErr ? mapErr(err) : (err as E);
      return Result.Err<T, E>(e);
    }
  }
  get tag(): ResultTag {
    return this.result.tag;
  }

  value(){
    switch (this.result.tag) {
      case "ok":
        return this.result.value;
      case "err":
        return this.result.value;
    }
  }

  isOk(): boolean {
    return this.result.tag === "ok";
  }

  isErr(): boolean {
    return this.result.tag === "err";
  }

  unwrap(): T {
    switch (this.result.tag) {
      case "ok":
        return this.result.value;
      case "err":
        throw new Error(
          `The program panicked at called Result.unwrap() on an Err value: ${this.result.value}`
        );
    }
  }

  expect(message: string): T {
    switch (this.result.tag) {
      case "ok":
        return this.result.value;
      case "err":
        throw new Error(`${message}: ${this.result.value}`);
    }
  }

  $(): T {
    switch(this.result.tag) {
      case "ok":
        return this.result.value;
      case "err":
        throw this.result.value;
    }
  }

  unwrapOr(defaultValue: T): T {
    switch (this.result.tag) {
      case "ok":
        return this.result.value;
      case "err":
        return defaultValue;
    }
  }

  unwrapOrElse(fn: (error: E) => T): T {
    switch (this.result.tag) {
      case "ok":
        return this.result.value;
      case "err":
        return fn(this.result.value);
    }
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    switch (this.result.tag) {
      case "ok":
        return Result.Ok(fn(this.result.value));
      case "err":
        return Result.Err(this.result.value);
    }
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    switch (this.result.tag) {
      case "ok":
        return Result.Ok(this.result.value);
      case "err":
        return Result.Err(fn(this.result.value));
    }
  }

  and<U>(other: Result<U, E>): Result<U, E> {
    switch (this.result.tag) {
      case "ok":
        return other;
      case "err":
        return Result.Err(this.result.value);
    }
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    switch (this.result.tag) {
      case "ok":
        return fn(this.result.value);
      case "err":
        return Result.Err(this.result.value);
    }
  }

  match<U, F>({
    Ok,
    Err,
  }: {
    Ok: (value: T) => U;
    Err: (error: E) => F;
  }): U | F {
    switch (this.result.tag) {
      case "ok":
        return Ok(this.result.value);
      case "err":
        return Err(this.result.value);
    }
  }
}
