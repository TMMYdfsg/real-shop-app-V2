// Augment `next` module with a fallback type to avoid IDE/TS errors
// for older code that imports `WebpackConfigContext` from 'next'.
import 'next';

declare module 'next' {
  export interface WebpackConfigContext {
    isServer?: boolean;
    dev?: boolean;
    /** allow other fields without type errors */
    [key: string]: any;
  }
}

export {};
