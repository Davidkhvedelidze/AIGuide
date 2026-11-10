export const appConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.example.com',
  requestTimeoutMs: 12_000,
} as const;
