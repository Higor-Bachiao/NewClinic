import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiSend } from "../api";
import { useAuth } from "../auth";
import { Role } from "../types";

export default function Login() {
  const [role, setRole] = useState<Role>("PATIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiSend("/auth/login", "POST", { email, password, role });
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
      <h2>Entrar no NewClinic</h2>

      <div className="role-toggle">
        <button className={role === "PATIENT" ? "active" : ""} onClick={() => setRole("PATIENT")}>
          Sou Paciente
        </button>
        <button className={role === "CLINIC" ? "active" : ""} onClick={() => setRole("CLINIC")}>
          Sou Clinica
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <div className="error">{error}</div>}

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
