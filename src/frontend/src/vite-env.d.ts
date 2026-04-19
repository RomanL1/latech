/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface Window {
  ENV: {
    VITE_API_HOST: string;
    VITE_WS_HOST: string;
  };
}
