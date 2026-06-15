import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiSend } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../components/Toast";
import { Role } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [role, setRole] = useState<Role>("PATIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Valida os campos e retorna os erros encontrados.
  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Informe o email.";
    else if (!EMAIL_RE.test(email)) e.email = "Email invalido.";
    if (!password) e.password = "Informe a senha.";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.warning("Verifique os campos destacados.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiSend("/auth/login", "POST", { email, password, role });
      login(data.token, data.user);
      toast.success(`Bem-vindo(a), ${data.user.name}!`);
      navigate("/agendamentos");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-box card">
      <h2>Entrar no NewClinic</h2>

      <div className="role-toggle">
        <button type="button" className={role === "PATIENT" ? "active" : ""} onClick={() => setRole("PATIENT")}>
          Sou Paciente
        </button>
        <button type="button" className={role === "CLINIC" ? "active" : ""} onClick={() => setRole("CLINIC")}>
          Sou Clinica
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            className={errors.email ? "invalid" : ""}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label>Senha</label>
          <input
            type="password"
            className={errors.password ? "invalid" : ""}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button className="btn" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 16 }}>
        Nao tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </div>
  );
}
