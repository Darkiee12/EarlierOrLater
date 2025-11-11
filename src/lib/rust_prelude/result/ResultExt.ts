import Result from "@/lib/rust_prelude/result/Result";

const propagate = <T, E extends Error>(body: () => T): Result<T, E> => {
  try {
    const result = body();
    return Result.Ok(result);
  } catch (error) {
    return Result.Err(error as E);
  }
};

const propagateAsync = async <T, E extends Error>(
  body: () => Promise<T>
): Promise<Result<T, E>> => {
  try {
    const result = await body();
    return Result.Ok(result);
  } catch (error) {
    return Result.Err(error as E);
  }
};

const ResultExt = {
  propagate,
  propagateAsync,
};


export default ResultExt;
