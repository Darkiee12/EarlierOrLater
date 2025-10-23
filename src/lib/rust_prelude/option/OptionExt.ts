import Option from "./Option";
const ifSome2 = <T, U>(
  opts: [Option<T>, Option<U>],
  fn: (t: T, u: U) => void
) => {
  opts[0].ifSome((t) => {
    opts[1].ifSome((u) => {
      fn(t, u);
    });
  });
};

const ifSome3 = <T, U, V>(
  opts: [Option<T>, Option<U>, Option<V>],
  fn: (t: T, u: U, v: V) => void
) => {
  opts[0].ifSome((t) => {
    opts[1].ifSome((u) => {
      opts[2].ifSome((v) => {
        fn(t, u, v);
      });
    });
  });
};

const ifSome4 = <T, U, V, W>(
  opts: [Option<T>, Option<U>, Option<V>, Option<W>],
  fn: (t: T, u: U, v: V, w: W) => void
) => {
  opts[0].ifSome((t) => {
    opts[1].ifSome((u) => {
      opts[2].ifSome((v) => {
        opts[3].ifSome((w) => {
          fn(t, u, v, w);
        });
      });
    });
  });
};

const ifMultiSome = <T>(opts: Option<T>[], fn: (...values: T[]) => void) => {
  const values: T[] = [];
  const helper = (index: number) => {
    if (index === opts.length) {
      fn(...values);
      return;
    }
    opts[index].ifSome((value) => {
      values[index] = value;
      helper(index + 1);
    });
  };
  helper(0);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ifDynamicSome = (opts: Option<any>[], fn: (...values: any[]) => void) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];
  const helper = (index: number) => {
    if (index === opts.length) {
      fn(...values);
      return;
    }
    opts[index].ifSome((value) => {
      values[index] = value;
      helper(index + 1);
    });
  };
  helper(0);
};



const OptionExt = {
  ifSome2,
  ifSome3,
  ifSome4,
  ifMultiSome,
  ifDynamicSome,
};

export default OptionExt;
