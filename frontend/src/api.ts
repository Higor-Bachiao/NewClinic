// Cliente HTTP simples. Usa o proxy /api configurado no Vite.
const BASE = "/api";

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
