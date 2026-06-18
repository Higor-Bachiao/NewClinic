// Cliente HTTP simples.
// Em produção, VITE_API_URL aponta para o backend (ex: https://...onrender.com).
// Em dev fica indefinido e usamos o proxy /api configurado no Vite.
const BASE = import.meta.env.VITE_API_URL ?? "/api";

// Monta a URL de um arquivo servido pelo backend (ex: fotos em /uploads/...).
// Em dev (sem VITE_API_URL) mantém o caminho relativo para o proxy do Vite.
const FILES_BASE = import.meta.env.VITE_API_URL ?? "";
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  // URLs absolutas (ex: fotos externas do Unsplash) sao usadas como estao.
  if (/^https?:\/\//.test(path)) return path;
  return `${FILES_BASE}${path}`;
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function handle(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Erro na requisicao");
  }
  return data;
}

export async function apiGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handle(res);
}

export async function apiSend(path: string, method: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

// Para cadastro com upload de foto (multipart/form-data)
export async function apiUpload(path: string, formData: FormData) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    body: formData,
  });
  return handle(res);
}

// Multipart autenticado (ex: editar perfil com foto). Nao define Content-Type
// manualmente para o browser incluir o boundary correto.
export async function apiUploadSend(path: string, method: string, formData: FormData) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  return handle(res);
}
