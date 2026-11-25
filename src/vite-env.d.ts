/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAPTCHA_ENABLED: string
  readonly VITE_CAP_API_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
