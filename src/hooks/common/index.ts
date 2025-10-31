import Option from "@/lib/rust_prelude/option/Option";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect } from "react";
import { Success, Err, Fail } from "@/lib/response";

/**
 * React Query-powered GET hook with optional post-processing.
 *
 * Fetches data via Axios using the provided URL and config, caches it under the given query key,
 * and optionally transforms the response item using a post-process function. Errors are surfaced via
 * React Query and also logged to the console.
 *
 * @template QueryKeyType - Type of the elements that make up the query key array.
 * @template ResponseType - The raw item type returned by the backend in `Success<ResponseType>`.
 * @template PostProcessType - The (optional) transformed type returned after applying `postProcess`.
 * Defaults to `ResponseType`.
 *
 * @param {QueryKeyType[]} queryKey - The React Query cache key for this request.
 * @param {{ url: string; config?: AxiosRequestConfig }} getParams - Request parameters.
 * @param {(data: ResponseType) => PostProcessType} [postProcess] - Optional transformation for the response item.
 *
 * @returns {{
 *   data: ResponseType | undefined,
 *   error: AxiosError<Err | Fail> | null,
 *   isLoading: boolean,
 *   isSuccess: boolean,
 *   isError: boolean
 * }} Query state for the GET request.
 *
 * @example
 * const { data, isLoading } = useGet([
 *   'events', year
 * ], { url: `/api/event?year=${year}` });
 */


export function useGet<
  QueryKeyType,
  ResponseType,
  PostProcessType extends ResponseType = ResponseType,
>(
  queryKey: QueryKeyType[],
  getParams: {
    url: string;
    config?: AxiosRequestConfig;
  },
  enabled: boolean = true,
  postProcess?: (data: ResponseType) => PostProcessType
) {
  const fetcher = Option.into(postProcess).match({
    Some: (fn) => {
      const fetcher = async () =>
        await axios
          .get<Success<ResponseType>, AxiosResponse<Success<ResponseType>>>(getParams.url, getParams.config)
          .then((res) => fn(res.data.item));
      return fetcher;
    },

    None: () => {
      const fetcher = async () =>
        await axios
          .get<Success<ResponseType>, AxiosResponse<Success<ResponseType>>>(getParams.url, getParams.config)
          .then((res) => res.data.item);
      return fetcher;
    },
  });
  const { data, error, isLoading, isSuccess, isError } = useQuery<
    ResponseType,
    AxiosError<Err | Fail>
  >({
    queryKey: queryKey,
    queryFn: fetcher,
    enabled
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching data:", error);
    }
  }, [error]);

  return { data, error, isLoading, isSuccess, isError };
}

/**
 * React Query-powered POST hook with optional post-processing and cache invalidation.
 *
 * Executes an Axios POST with the provided payload and config. On success, invalidates the given
 * query key (if provided) and optionally transforms the returned item via `postProcess`.
 *
 * @template QueryKeyType - Type of the elements that make up the query key array.
 * @template PayloadType - The type of the POST payload.
 * @template ResponseType - The raw item type returned by the backend in `Success<ResponseType>`.
 * @template PostProcessType - The (optional) transformed type returned after applying `postProcess`.
 * Defaults to `ResponseType`.
 *
 * @param {QueryKeyType[] | undefined} queryKey - Optional query key to invalidate on success.
 * @param {{ url: string; payload?: PayloadType; config?: AxiosRequestConfig }} postParams - Request parameters. You can either
 * provide a default payload here or pass the payload later via mutate(variables).
 * @param {(data: ResponseType) => PostProcessType} [postProcess] - Optional transformation for the response item.
 *
 * @returns {{
 *   mutate: (variables: PayloadType) => void,
 *   mutateAsync: (variables: PayloadType) => Promise<ResponseType>,
 *   data: ResponseType | undefined,
 *   error: AxiosError<Err | Fail, PayloadType> | null,
 *   isLoading: boolean,
 *   isSuccess: boolean,
 *   isError: boolean,
 * }} Mutation helpers and state for the POST request.
 *
 * @example
 * const { mutate, isLoading } = usePost([
 *   'events'
 * ], {
 *   url: '/api/event',
 *   payload: { title: 'New event' }
 * });
 *
 * // Later
 * mutate({ title: 'Another event' });
 */
export function usePost<
  QueryKeyType,
  PayloadType,
  ResponseType,
  PostProcessType extends ResponseType = ResponseType,
>(
  queryKey: QueryKeyType[] | undefined,
  postParams: {
    url: string;
    config?: AxiosRequestConfig;
  },
  postProcess?: (data: ResponseType) => PostProcessType
) {
  const queryClient = useQueryClient();

  const mutationFn = Option.into(postProcess).match({
    Some: (fn) => {
      const fetcher = async (payload: PayloadType) =>
        await axios
          .post<Success<ResponseType>, AxiosResponse<Success<ResponseType>>>(
            postParams.url,
            payload,
            postParams.config
          )
          .then((res) => fn(res.data.item));
      return fetcher;
    },
    None: () => {
      const fetcher = async (payload: PayloadType) =>
        await axios
          .post<Success<ResponseType>, AxiosResponse<Success<ResponseType>>>(
            postParams.url,
            payload,
            postParams.config
          )
          .then((res) => res.data.item);
      return fetcher;
    },
  });

  const mutation = useMutation<ResponseType, AxiosError<Err | Fail, PayloadType>, PayloadType>(
    {
      mutationFn,
      onSuccess: () => {
        if (queryKey) {
          queryClient.invalidateQueries({ queryKey });
        }
      },
      onError: (err) => {
        console.error("Error during post mutation:", err);
      },
    }
  );

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data,
    error: mutation.error,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}
