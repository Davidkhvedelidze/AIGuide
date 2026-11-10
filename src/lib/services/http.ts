import { logger } from '@/lib/logger/logger';

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

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

interface ErrorResponseBody {
  error?: {
    code?: unknown;
    message?: unknown;
  };
  message?: unknown;
}

function getErrorMessage(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return 'We could not complete the request. Please try again.';
  }

  const candidate = body as ErrorResponseBody;

  if (typeof candidate.error?.message === 'string') {
    return candidate.error.message;
  }

  if (typeof candidate.message === 'string') {
    return candidate.message;
  }

  return 'We could not complete the request. Please try again.';
}

function getErrorCode(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return 'HTTP_ERROR';
  }

  const candidate = body as ErrorResponseBody;
  return typeof candidate.error?.code === 'string' ? candidate.error.code : 'HTTP_ERROR';
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function executeJsonRequest<T>(url: string, options: RequestOptions): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await readJsonSafely(response);
      logger.warn('HTTP request failed', { status: response.status, url });

      return {
        success: false,
        error: {
          code: getErrorCode(errorBody),
          message: getErrorMessage(errorBody),
          status: response.status,
        },
      };
    }

    const data = (await response.json()) as T;

    return { success: true, data };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    logger.error('HTTP request exception', { url, isAbort });

    return {
      success: false,
      error: {
        code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isAbort ? 'The request timed out. Check your connection and try again.' : 'You appear to be offline. Please try again later.',
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  return executeJsonRequest<T>(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export async function requestFormDataJson<T>(url: string, body: FormData, options: RequestOptions = {}): Promise<ApiResult<T>> {
  return executeJsonRequest<T>(url, {
    ...options,
    method: options.method ?? 'POST',
    body,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
    timeoutMs: options.timeoutMs ?? 30_000,
  });
}
