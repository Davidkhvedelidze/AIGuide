declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: unknown;
  }
}

declare module 'react' {
  export type PropsWithChildren<P = object> = P & { children?: ReactNode };
  export type ReactNode = unknown;
  export type RefObject<T> = { current: T };
  export function useCallback<T extends (...args: never[]) => unknown>(callback: T, deps: readonly unknown[]): T;
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useRef<T>(initialValue: T): RefObject<T>;
  export function useState<T>(initialValue: T | (() => T)): [T, (value: T | ((current: T) => T)) => void];
}

declare module 'react-native' {
  import type { PropsWithChildren } from 'react';

  export interface TextStyle {
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  }

  export interface ViewStyle {
  }

  export interface TextProps {
    style?: unknown;
    accessibilityRole?: string;
    accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  }

  export interface ViewProps {
    key?: string;
    style?: unknown;
    accessibilityRole?: string;
    accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  }

  export interface PressableStateCallbackType {
    pressed: boolean;
  }

  export interface PressableProps extends PropsWithChildren {
    accessibilityLabel?: string;
    accessibilityRole?: string;
    disabled?: boolean;
    onPress?: () => void;
    style?: unknown | ((state: PressableStateCallbackType) => unknown);
  }

  export const ActivityIndicator: (props: { color?: string; size?: 'small' | 'large'; [key: string]: unknown }) => JSX.Element;
  export const Image: (props: { source: { uri: string }; style?: unknown; accessibilityLabel?: string }) => JSX.Element;
  export const Pressable: (props: PressableProps) => JSX.Element;
  export const SafeAreaView: (props: PropsWithChildren<ViewProps>) => JSX.Element;
  export const ScrollView: (props: PropsWithChildren<ViewProps & { contentContainerStyle?: unknown }>) => JSX.Element;
  export const Text: (props: PropsWithChildren<TextProps>) => JSX.Element;
  export const View: (props: PropsWithChildren<ViewProps>) => JSX.Element;
  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T;
  };
}

declare module 'expo-camera' {
  import type { RefObject } from 'react';

  export interface PermissionResponse {
    granted: boolean;
    canAskAgain: boolean;
    status: 'granted' | 'denied' | 'undetermined';
  }

  export interface PhotoResult {
    uri: string;
  }

  export interface CameraView {
    takePictureAsync(options?: { quality?: number }): Promise<PhotoResult>;
  }

  export const CameraView: (props: {
    ref?: RefObject<CameraView | null>;
    style?: unknown;
    facing?: 'front' | 'back';
    mode?: 'picture' | 'video';
  }) => JSX.Element;

  export function useCameraPermissions(): [PermissionResponse | null, () => Promise<PermissionResponse>];
}

declare module 'expo-location' {
  export const Accuracy: {
    Balanced: number;
  };

  export interface LocationPermissionResponse {
    granted: boolean;
  }

  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
    };
  }

  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getCurrentPositionAsync(options?: { accuracy?: number }): Promise<LocationObject>;
}

declare module 'expo-router' {
  export const router: {
    back: () => void;
    push: (href: string | { pathname: string; params?: Record<string, string> }) => void;
    replace: (href: string) => void;
  };

  export function useLocalSearchParams<T extends Record<string, string | undefined>>(): T;

  export const Stack: ((props: { children?: unknown; screenOptions?: Record<string, unknown> }) => JSX.Element) & {
    Screen: (props: { name: string; options?: Record<string, unknown> }) => JSX.Element;
  };
}

declare module 'expo-status-bar' {
  export const StatusBar: (props: { style?: 'auto' | 'inverted' | 'light' | 'dark' }) => JSX.Element;
}


declare module 'react/jsx-runtime' {
  export const jsx: unknown;
  export const jsxs: unknown;
  export const Fragment: unknown;
}
