/// <reference types="vite/client" />

// Environment variables type definitions for Vite
interface ImportMetaEnv {
  readonly VITE_CLUSTER?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_PROGRAM_ID?: string;
  readonly VITE_GATEWAY_API_KEY?: string;
  readonly VITE_GATEWAY_ENABLED?: string;
  readonly VITE_GATEWAY_API_URL?: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_LOG_LEVEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}