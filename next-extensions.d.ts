// Augment `next` module with fallback types to avoid TS errors.
// This file is at the root level to ensure it's picked up by next build's TypeScript compiler.
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
