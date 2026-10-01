/// <reference types="vite/client" />

declare module "*.svg" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
