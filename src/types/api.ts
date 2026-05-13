export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    status?: number;
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
