/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CHAIN?: string;
  readonly VITE_WC_PROJECT_ID?: string;
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_PAYMENT_TOKEN?: string;
  readonly VITE_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
