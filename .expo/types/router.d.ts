/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/ask-guide`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/onboarding`; params?: Router.UnknownInputParams; } | { pathname: `/camera-scan`; params?: Router.UnknownInputParams; } | { pathname: `/nearby`; params?: Router.UnknownInputParams; } | { pathname: `/result`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/ask-guide`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/onboarding`; params?: Router.UnknownOutputParams; } | { pathname: `/camera-scan`; params?: Router.UnknownOutputParams; } | { pathname: `/nearby`; params?: Router.UnknownOutputParams; } | { pathname: `/result`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/ask-guide${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/onboarding${`?${string}` | `#${string}` | ''}` | `/camera-scan${`?${string}` | `#${string}` | ''}` | `/nearby${`?${string}` | `#${string}` | ''}` | `/result${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/ask-guide`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/onboarding`; params?: Router.UnknownInputParams; } | { pathname: `/camera-scan`; params?: Router.UnknownInputParams; } | { pathname: `/nearby`; params?: Router.UnknownInputParams; } | { pathname: `/result`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
