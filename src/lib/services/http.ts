import { appConfig } from '@/lib/config/env';
import { logger } from '@/lib/logger/logger';
import type { ApiResult } from '@/types/api';

interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

const createTimeoutSignal = (timeoutMs: number): AbortSignal => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
};

export const httpClient = {
  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<ApiResult<T>> {
    const { body, headers, timeoutMs = appConfig.requestTimeoutMs, ...requestOptions } = options;

    try {
      const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
        ...requestOptions,
        body: body === undefined ? undefined : JSON.stringify(body),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: createTimeoutSignal(timeoutMs),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'HTTP_ERROR',
            message: 'We could not complete the request. Please try again.',
            status: response.status,
          },
        };
      }

      return { success: true, data: (await response.json()) as T };
    } catch (error) {
      logger.error('Network request failed', {
        path,
        reason: error instanceof Error ? error.name : 'unknown',
      });

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Please check your connection and try again.',
        },
      };
    }
  },
};
