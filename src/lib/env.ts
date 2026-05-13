declare const process: {
  env: Record<string, string | undefined>;
};

interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function readRequiredEnv(name: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_ANON_KEY'): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required. Add it to your Expo environment before starting the app.`);
  }

  return value;
}

export const env: AppEnv = {
  supabaseUrl: readRequiredEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readRequiredEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
};
