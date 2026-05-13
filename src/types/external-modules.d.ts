declare module 'react' {
  export type ReactNode = unknown;
}

declare module 'react/jsx-runtime' {
  export const Fragment: unknown;
  export function jsx(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export function jsxs(type: unknown, props: unknown, key?: unknown): JSX.Element;
}

declare module 'react-native' {
  export interface PressableProps {
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: Record<string, unknown>;
    className?: string;
    disabled?: boolean;
    onPress?: () => void;
  }

  export interface ViewProps {
    className?: string;
    accessibilityRole?: string;
  }

  export const ActivityIndicator: (props: Record<string, unknown>) => JSX.Element;
  export const Pressable: (props: PressableProps & { children?: unknown }) => JSX.Element;
  export const ScrollView: (props: ViewProps & { contentContainerClassName?: string; children?: unknown }) => JSX.Element;
  export const Text: (props: ViewProps & { children?: unknown }) => JSX.Element;
  export const TextInput: (props: ViewProps & Record<string, unknown>) => JSX.Element;
  export const View: (props: ViewProps & { children?: unknown }) => JSX.Element;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaView: (props: { className?: string; children?: unknown }) => JSX.Element;
}

declare module 'expo-router' {
  export const router: {
    push: (href: string) => void;
    replace: (href: string) => void;
  };
  export const Stack: ((props: { screenOptions?: Record<string, unknown>; children?: unknown }) => JSX.Element) & {
    Screen: (props: { name: string; options?: Record<string, unknown> }) => JSX.Element;
  };
}

declare module 'expo-status-bar' {
  export const StatusBar: (props: { style?: 'auto' | 'dark' | 'light' }) => JSX.Element;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicAttributes {
    key?: string | number;
  }
}

declare const console: {
  info: (message?: unknown, ...optionalParams: unknown[]) => void;
  warn: (message?: unknown, ...optionalParams: unknown[]) => void;
  error: (message?: unknown, ...optionalParams: unknown[]) => void;
};

declare const process: {
  env: NodeJS.ProcessEnv;
};

declare class AbortController {
  signal: AbortSignal;
  abort(): void;
}

declare interface AbortSignal {}

declare function setTimeout(handler: () => void, timeout?: number): number;

declare interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string | undefined;
  signal?: AbortSignal;
}

declare interface Response {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

declare function fetch(input: string, init?: RequestInit): Promise<Response>;
