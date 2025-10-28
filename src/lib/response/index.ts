export type ResponseStatus = "success" | "fail" | "error";
export type FailedData = {
    title: string;
}


export type BaseResponse = {
    status: ResponseStatus;
    timestamp: number;
};

export type Success<T> = BaseResponse & {
    status: "success";
    item: T;
};

export type Fail = BaseResponse & {
    status: "fail";
    data: FailedData;
};

export type Err = BaseResponse & {
    status: "error";
    message: string;
    code?: string;
};

export type ApiResult<T> = Success<T> | Fail | Err;

export const success = <T>(item: T, timestamp: number = Date.now()): Success<T> => ({
    status: "success",
    timestamp,
    item
});

export const fail = (data: FailedData, timestamp: number = Date.now()): Fail => ({
    status: "fail",
    timestamp,
    data,
});

export const error = (message: string, code?: string, timestamp: number = Date.now()): Err => ({
    status: "error",
    timestamp,
    message,
    code,
});

const ApiResponse = {
    success,
    fail,
    error,
};

export default ApiResponse;