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

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.warn('HTTP request failed', { status: response.status, url });

      return {
        success: false,
        error: {
          code: 'HTTP_ERROR',
          message: 'We could not complete the request. Please try again.',
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
