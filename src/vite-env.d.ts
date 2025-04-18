
/// <reference types="vite/client" />

// Add global TypeScript definitions for polyfills
interface Window {
  global?: any;
  stream?: any;
  url?: any;
  util?: any;
  http?: any;
}

interface NodeJS {
  ReadableStream?: any;
}

declare var globalThis: Window;
