import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import { Clinic, ClinicReviews } from "../types";
import StarRating from "../components/StarRating";
import Avatar from "../components/Avatar";
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

interface ClinicWithReviews extends Clinic {
  avg: number | null;
  totalReviews: number;
}

export default function SearchClinics() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [clinics, setClinics] = useState<ClinicWithReviews[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Clinic | null>(null);

  // id da clínica com o painel de avaliação aberto
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  async function search() {
    setLoading(true);
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (specialty) params.set("specialty", specialty);
    try {
      const data: Clinic[] = await apiGet(`/clinics?${params.toString()}`);
      // busca médias em paralelo
      const withReviews: ClinicWithReviews[] = await Promise.all(
        data.map(async (c) => {
          const rv: ClinicReviews = await apiGet(`/clinics/${c.id}/reviews`);
          return { ...c, avg: rv.avg, totalReviews: rv.total };
        })
      );
      setClinics(withReviews);
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

  function openReview(clinicId: string) {
    setReviewingId(clinicId);
    setReviewRating(0);
    setReviewComment("");
  }

  async function submitReview(clinicId: string) {
    if (reviewRating === 0) {
      toast.error("Selecione uma nota antes de enviar.");
      return;
    }
    setReviewLoading(true);
    try {
      await apiSend(`/clinics/${clinicId}/reviews`, "POST", {
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      setReviewingId(null);
      toast.success("Avaliação enviada!");
      search(); // atualiza médias
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <div>
      <h2>Buscar Clínicas</h2>

      <div className="card">
        <div className="row">
          <div className="field">
            <label>Nome da Clínica</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Buscar por nome" />
          </div>
          <div className="field">
            <label>Especialidade</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="">Todas</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <button className="btn" onClick={search}>Buscar</button>
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
          <div className="card" key={c.id}>
            <div className="list-item">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar src={c.photoUrl} type="CLINIC" />
                <div>
                  <strong>{c.clinicName}</strong>
                  <div className="muted">{c.specialty} · {c.openTime}–{c.closeTime}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <StarRating value={c.avg ?? 0} size={18} />
                    <span className="muted">
                      {c.avg !== null ? c.avg.toFixed(1) : "—"} ({c.totalReviews})
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn secondary" onClick={() => openReview(c.id)}>
                  Avaliar
                </button>
                <button className="btn" onClick={() => setSelected(c)}>
                  <Icon name="event_available" size={18} />
                  Agendar
                </button>
              </div>
            </div>

            {reviewingId === c.id && (
              <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                <p style={{ margin: "0 0 8px", fontWeight: 500 }}>Sua avaliação</p>
                <div style={{ marginBottom: 12 }}>
                  <StarRating value={reviewRating} onChange={setReviewRating} size={30} />
                  {reviewRating > 0 && (
                    <span className="muted" style={{ marginLeft: 8 }}>{reviewRating} estrelas</span>
                  )}
                </div>
                <div className="field">
                  <label>Comentário (opcional)</label>
                  <input
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Conte sua experiência..."
                  />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    className="btn"
                    disabled={reviewLoading}
                    onClick={() => submitReview(c.id)}
                  >
                    {reviewLoading ? "Enviando..." : "Enviar"}
                  </button>
                  <button className="btn secondary" onClick={() => setReviewingId(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      <ScheduleModal clinic={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
