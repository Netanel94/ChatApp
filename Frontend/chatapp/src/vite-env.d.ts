/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_FOLDER: string;
  // Add any other environment variables your app uses here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
