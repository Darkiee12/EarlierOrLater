import Option from "./Option";
type IntoOption<T> = Option<T> | T | null | undefined;

/**
 * Executes a handler function if both options contain values.
 * This is a convenience function for handling two optional values that both need to be present.
 *
 * @template T1 - The type of the first option's value
 * @template T2 - The type of the second option's value
 * @param opt1 - The first option to check (can be Option<T1>, T1, null, or undefined)
 * @param opt2 - The second option to check (can be Option<T2>, T2, null, or undefined)
 * @param handlers - The callback function to execute if both options have values
 *
 * @example
 * ```typescript
 * ifSome2({
 *   opt1: Some(5),
 *   opt2: Some("hello"),
 *   handlers: (num, str) => console.log(num, str)
 * }); // Logs: 5 "hello"
 * ```
 */
const ifSome2 = <T1, T2>({
  opt1,
  opt2,
  handlers,
}: {
  opt1: IntoOption<T1>;
  opt2: IntoOption<T2>;
  handlers: (opt1: T1, opt2: T2) => void;
}) => {
  Option.into(opt1).ifSome((t) => {
    Option.into(opt2).ifSome((u) => {
      handlers(t, u);
    });
  });
};

/**
 * Executes a handler function if all three options contain values.
 * This is a convenience function for handling three optional values that all need to be present.
 * @template T1 - The type of the first option's value
 * @template T2 - The type of the second option's value
 * @template T3 - The type of the third option's value
 * @param opt1 - The first option to check (can be Option<T1>, T1, null, or undefined)
 * @param opt2 - The second option to check (can be Option<T2>, T2, null, or undefined)
 * @param opt3 - The third option to check (can be Option<T3>, T3, null, or undefined)
 * @param handlers - The callback function to execute if all three options have values
 * @example
 * ```typescript
 * ifSome3({
 *   opt1: Some(true),
 *   opt2: "doofuswolfie",
 *   opt3: Some(20),
 *   handlers: (bool, name, num) => console.log(`It's ${bool} that I say "${name}" ${num} times!`)
 * }); // Logs: It's true that I say "doofuswolfie" 20 times!
 * ```
 */

const ifSome3 = <T1, T2, T3>({
  opt1,
  opt2,
  opt3,
  handlers,
}: {
  opt1: IntoOption<T1>;
  opt2: IntoOption<T2>;
  opt3: IntoOption<T3>;
  handlers: (opt1: T1, opt2: T2, opt3: T3) => void;
}) => {
  Option.into(opt1).ifSome((t) => {
    Option.into(opt2).ifSome((u) => {
      Option.into(opt3).ifSome((v) => {
        handlers(t, u, v);
      });
    });
  });
};

const ifSome4 = <T1, T2, T3, T4>({
  opt1,
  opt2,
  opt3,
  opt4,
  handlers,
}: {
  opt1: IntoOption<T1>;
  opt2: IntoOption<T2>;
  opt3: IntoOption<T3>;
  opt4: IntoOption<T4>;
  handlers: (opt1: T1, opt2: T2, opt3: T3, opt4: T4) => void;
}) => {
  Option.into(opt1).ifSome((t) => {
    Option.into(opt2).ifSome((u) => {
      Option.into(opt3).ifSome((v) => {
        Option.into(opt4).ifSome((w) => {
          handlers(t, u, v, w);
        });
      });
    });
  });
};

const ifSome5 = <T1, T2, T3, T4, T5>({
  opt1,
  opt2,
  opt3,
  opt4,
  opt5,
  handlers,
}: {
  opt1: IntoOption<T1>;
  opt2: IntoOption<T2>;
  opt3: IntoOption<T3>;
  opt4: IntoOption<T4>;
  opt5: IntoOption<T5>;
  handlers: (opt1: T1, opt2: T2, opt3: T3, opt4: T4, opt5: T5) => void;
}) => {
  Option.into(opt1).ifSome((t) => {
    Option.into(opt2).ifSome((u) => {
      Option.into(opt3).ifSome((v) => {
        Option.into(opt4).ifSome((w) => {
          Option.into(opt5).ifSome((x) => {
            handlers(t, u, v, w, x);
          });
        });
      });
    });
  });
};

 
type UnwrapOptions<T extends readonly any[]> = {
  [K in keyof T]: T[K] extends IntoOption<infer U> ? U : never;
};

const ifSomeN = <T extends readonly IntoOption<unknown>[]>(
  options: [...T],
  handler: (...values: UnwrapOptions<T>) => void
): void => {
   
  const unwrapped: any[] = [];

  for (const opt of options) {
    const option = Option.into(opt);
    if (option.isNone()) {
      return;
    }
    unwrapped.push(option.unwrap());
  }

  handler(...(unwrapped as UnwrapOptions<T>));
};

type AllMatch2Handlers<T1, T2, U> = {
  SomeSome: (a: T1, b: T2) => U;
  SomeNone: (a: T1) => U;
  NoneSome: (b: T2) => U;
  NoneNone: () => U;
};

type Match2Handlers<T1, T2, U> =
  | (Required<AllMatch2Handlers<T1, T2, U>> & { _?: () => U })
  | (Partial<AllMatch2Handlers<T1, T2, U>> & { _: () => U });

const match2 = <T1, T2, U>(params: {
  opt1: Option<T1> | T1 | null | undefined;
  opt2: Option<T2> | T2 | null | undefined;
  cases: Match2Handlers<T1, T2, U>;
}): U => {
  const { opt1, opt2, cases } = params;

  const _opt1 = Option.into(opt1);
  const _opt2 = Option.into(opt2);

  const someSome = cases.SomeSome;
  const someNone = cases.SomeNone;
  const noneSome = cases.NoneSome;
  const noneNone = cases.NoneNone;
  const defaultCase = cases._;

  const noHandlerError = (): never =>
    (() => {
      throw new Error(
        "Non-exhaustive match: missing handler and no default (_) provided"
      );
    })();

  return _opt1.match({
    Some: (a: T1) =>
      _opt2.match({
        Some: (b: T2) =>
          someSome
            ? someSome(a, b)
            : defaultCase
            ? defaultCase()
            : noHandlerError(),
        None: () =>
          someNone
            ? someNone(a)
            : defaultCase
            ? defaultCase()
            : noHandlerError(),
      }),
    None: () =>
      _opt2.match({
        Some: (b: T2) =>
          noneSome
            ? noneSome(b)
            : defaultCase
            ? defaultCase()
            : noHandlerError(),
        None: () =>
          noneNone
            ? noneNone()
            : defaultCase
            ? defaultCase()
            : noHandlerError(),
      }),
  });
};


const OptionExt = {
  ifSome2,
  ifSome3,
  ifSome4,
  ifSome5,
  ifSomeN,
  match2,
};

export default OptionExt;
