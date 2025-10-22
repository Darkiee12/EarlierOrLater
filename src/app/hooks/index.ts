import Option from "@/rust_prelude/option/Option";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useEffect } from "react";

export function useGet<
  QueryKeyType,
  ResponseType,
  PostProcessType extends ResponseType = ResponseType,
  PossibleErrorType extends Error = Error
>(
  queryKey: QueryKeyType[],
  getParams: {
    url: string;
    config?: AxiosRequestConfig;
  },
  postProcess?: (data: ResponseType) => PostProcessType
) {
  const fetcher = Option.into(postProcess).match({
    Some: (fn) => {
      const fetcher = async () =>
        await axios
          .get<ResponseType>(getParams.url, getParams.config)
          .then((res) => fn(res.data));
      return fetcher;
    },

    None: () => {
      const fetcher = async () =>
        await axios
          .get<ResponseType>(getParams.url, getParams.config)
          .then((res) => res.data);
      return fetcher;
    },
  });
  const { data, error, isLoading, isSuccess, isError } = useQuery<
    ResponseType,
    AxiosError<PossibleErrorType>
  >({
    queryKey: queryKey,
    queryFn: fetcher,
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching data:", error);
    }
  }, [error]);

  return { data, error, isLoading, isSuccess, isError };
}

export function usePost<
  QueryKeyType,
  PayloadType,
  ResponseType,
  PostProcessType extends ResponseType = ResponseType,
  PossibleErrorType extends Error = Error
>(
  queryKey: QueryKeyType[] | undefined,
  postParams: {
    url: string;
    payload: PayloadType;
    config?: AxiosRequestConfig;
  },
  postProcess?: (data: ResponseType) => PostProcessType
) {
  const queryClient = useQueryClient();

  const mutationFn = Option.into(postProcess).match({
    Some: (fn) => {
      const fetcher = async() => await axios
        .post<ResponseType>(
          postParams.url,
          postParams.payload,
          postParams.config
        )
        .then((res) => fn(res.data));
      return fetcher;
    },
    None: () => {
        const fetcher = async() => await axios
        .post<ResponseType>(
          postParams.url,
          postParams.payload,
          postParams.config
        )
        .then((res) => res.data );
      return fetcher;
      }
  });

  const mutation = useMutation<ResponseType, PossibleErrorType, PayloadType>(
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
