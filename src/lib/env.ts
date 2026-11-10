declare const process: {
  env: Record<string, string | undefined>;
};

interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  analyzeScanUrl: string;
}

function readRequiredEnv(name: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_ANON_KEY' | 'EXPO_PUBLIC_ANALYZE_SCAN_URL'): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required. Add it to your Expo environment before starting the app.`);
  }

  return value;
}

export const env: AppEnv = {
  supabaseUrl: readRequiredEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readRequiredEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  analyzeScanUrl: readRequiredEnv('EXPO_PUBLIC_ANALYZE_SCAN_URL'),
};
