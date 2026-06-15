import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { Clinic } from "../types";
import { useToast } from "../components/Toast";
import ScheduleModal from "../components/ScheduleModal";
import Icon from "../components/Icon";

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
  const toast = useToast();
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Clinic | null>(null);

  async function search() {
    setLoading(true);
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (specialty) params.set("specialty", specialty);
    try {
      const data = await apiGet(`/clinics?${params.toString()}`);
      setClinics(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : clinics.length === 0 ? (
        <div className="empty-state">
          <Icon name="search_off" size={48} className="empty-icon" />
          <p>Nenhuma clinica encontrada. Tente outro nome ou especialidade.</p>
        </div>
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
            <button className="btn" onClick={() => setSelected(c)}>
              <Icon name="event_available" size={18} />
              Agendar
            </button>
          </div>
        ))
      )}

      <ScheduleModal clinic={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
