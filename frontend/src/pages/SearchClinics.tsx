import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import { Clinic } from "../types";

const SPECIALTIES = [
  "Dermatologista",
  "Cardiologista",
  "Ortopedista",
  "Oftalmologista",
  "Pediatra",
  "Psicologo",
  "Nutricionista",
];

export default function SearchClinics() {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function search() {
    setLoading(true);
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (specialty) params.set("specialty", specialty);
    try {
      const data = await apiGet(`/clinics?${params.toString()}`);
      setClinics(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestAppointment(clinic: Clinic) {
    const date = prompt(
      `Agendar em "${clinic.clinicName}"\nAtende das ${clinic.openTime} as ${clinic.closeTime}.\nInforme data e hora (ex: 2026-07-10 14:30):`
    );
    if (!date) return;
    try {
      await apiSend("/appointments", "POST", { clinicId: clinic.id, date });
      setMsg(`Agendamento solicitado em ${clinic.clinicName}. Veja em "Agendamentos".`);
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  return (
    <div>
      <h2>Buscar Clinicas</h2>

      <div className="card">
        <div className="row">
          <div className="field">
            <label>Nome da Clinica</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Buscar por nome" />
          </div>
          <div className="field">
            <label>Especialidade</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="">Todas</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <button className="btn" onClick={search}>
              Buscar
            </button>
          </div>
        </div>
      </div>

      {msg && <div className="card" style={{ background: "#ecfdf5" }}>{msg}</div>}

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : clinics.length === 0 ? (
        <p className="muted">Nenhuma clinica encontrada.</p>
      ) : (
        clinics.map((c) => (
          <div className="card list-item" key={c.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img className="avatar" src={c.photoUrl || ""} alt="" />
              <div>
                <strong>{c.clinicName}</strong>
                <div className="muted">
                  {c.specialty} · {c.openTime}–{c.closeTime}
                </div>
              </div>
            </div>
            <button className="btn" onClick={() => requestAppointment(c)}>
              Agendar
            </button>
          </div>
        ))
      )}
    </div>
  );
}
