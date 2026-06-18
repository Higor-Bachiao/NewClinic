/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Origem do backend em produção (ex: https://newclinic-backend.onrender.com).
  // Em dev fica vazio e o proxy do Vite cuida de /api e /uploads.
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
