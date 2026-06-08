import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUpload } from "../api";
import { useAuth } from "../auth";
import { Role } from "../types";

const SPECIALTIES = [
  "Dermatologista",
  "Cardiologista",
  "Ortopedista",
  "Oftalmologista",
  "Pediatra",
  "Psicologo",
  "Nutricionista",
];

export default function Register() {
  const [role, setRole] = useState<Role>("PATIENT");
  const [form, setForm] = useState<Record<string, string>>({ specialty: SPECIALTIES[0] });
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append("photo", photo);

    const endpoint = role === "PATIENT" ? "/auth/register/patient" : "/auth/register/clinic";

    try {
      const data = await apiUpload(endpoint, fd);
      login(data.token, data.user);
      navigate("/agendamentos");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-box card">
      <h2>Criar conta</h2>

      <div className="role-toggle">
        <button className={role === "PATIENT" ? "active" : ""} onClick={() => setRole("PATIENT")}>
          Sou Paciente
        </button>
        <button className={role === "CLINIC" ? "active" : ""} onClick={() => setRole("CLINIC")}>
          Sou Clinica
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {role === "PATIENT" ? (
          <>
            <Input label="Nome Completo" k="fullName" set={set} />
            <Input label="Username" k="username" set={set} />
            <Input label="CPF" k="cpf" set={set} />
          </>
        ) : (
          <>
            <Input label="Nome da Clinica" k="clinicName" set={set} />
            <Input label="Nome do Dono" k="ownerName" set={set} />
            <Input label="CNPJ" k="cnpj" set={set} />
            <div className="field">
              <label>Especialidade</label>
              <select value={form.specialty} onChange={(e) => set("specialty", e.target.value)}>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <Input label="Email" k="email" type="email" set={set} />
        <Input label="Senha" k="password" type="password" set={set} />
        <Input label="Confirmar Senha" k="confirmPassword" type="password" set={set} />

        <div className="field">
          <label>Foto de Perfil</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </div>

        {error && <div className="error">{error}</div>}

        <button className="btn" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 16 }}>
        Ja tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}

function Input({
  label,
  k,
  type = "text",
  set,
}: {
  label: string;
  k: string;
  type?: string;
  set: (k: string, v: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} onChange={(e) => set(k, e.target.value)} required />
    </div>
  );
}
