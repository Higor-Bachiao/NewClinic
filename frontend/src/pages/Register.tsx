import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUpload } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../components/Toast";
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Campos obrigatorios por perfil (alem de email/senha que sao comuns).
const REQUIRED: Record<Role, { key: string; label: string }[]> = {
  PATIENT: [
    { key: "fullName", label: "Nome Completo" },
    { key: "username", label: "Username" },
    { key: "cpf", label: "CPF" },
  ],
  CLINIC: [
    { key: "clinicName", label: "Nome da Clinica" },
    { key: "ownerName", label: "Nome do Dono" },
    { key: "cnpj", label: "CNPJ" },
  ],
};

export default function Register() {
  const [role, setRole] = useState<Role>("PATIENT");
  const [form, setForm] = useState<Record<string, string>>({ specialty: SPECIALTIES[0] });
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  // Valida campos obrigatorios, formato de email e confirmacao de senha.
  function validate() {
    const e: Record<string, string> = {};
    for (const f of REQUIRED[role]) {
      if (!form[f.key]?.trim()) e[f.key] = `Informe ${f.label.toLowerCase()}.`;
    }
    if (!form.email?.trim()) e.email = "Informe o email.";
    else if (!EMAIL_RE.test(form.email)) e.email = "Email invalido.";

    if (!form.password) e.password = "Informe a senha.";
    else if (form.password.length < 6) e.password = "A senha precisa ter ao menos 6 caracteres.";

    if (!form.confirmPassword) e.confirmPassword = "Confirme a senha.";
    else if (form.password && form.password !== form.confirmPassword)
      e.confirmPassword = "As senhas nao conferem.";

    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.warning("Corrija os campos destacados para continuar.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append("photo", photo);

    const endpoint = role === "PATIENT" ? "/auth/register/patient" : "/auth/register/clinic";

    try {
      const data = await apiUpload(endpoint, fd);
      login(data.token, data.user);
      toast.success("Conta criada com sucesso!");
      navigate("/agendamentos");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-box card">
      <h2>Criar conta</h2>

      <div className="role-toggle">
        <button type="button" className={role === "PATIENT" ? "active" : ""} onClick={() => setRole("PATIENT")}>
          Sou Paciente
        </button>
        <button type="button" className={role === "CLINIC" ? "active" : ""} onClick={() => setRole("CLINIC")}>
          Sou Clinica
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {role === "PATIENT" ? (
          <>
            <Input label="Nome Completo" k="fullName" set={set} error={errors.fullName} />
            <Input label="Username" k="username" set={set} error={errors.username} />
            <Input label="CPF" k="cpf" set={set} error={errors.cpf} />
          </>
        ) : (
          <>
            <Input label="Nome da Clinica" k="clinicName" set={set} error={errors.clinicName} />
            <Input label="Nome do Dono" k="ownerName" set={set} error={errors.ownerName} />
            <Input label="CNPJ" k="cnpj" set={set} error={errors.cnpj} />
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

        <Input label="Email" k="email" type="email" set={set} error={errors.email} />
        <Input label="Senha" k="password" type="password" set={set} error={errors.password} />
        <Input
          label="Confirmar Senha"
          k="confirmPassword"
          type="password"
          set={set}
          error={errors.confirmPassword}
        />

        <div className="field">
          <label>Foto de Perfil</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </div>

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
  error,
}: {
  label: string;
  k: string;
  type?: string;
  set: (k: string, v: string) => void;
  error?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        className={error ? "invalid" : ""}
        onChange={(e) => set(k, e.target.value)}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
