import { useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../components/Toast";
import { ConfirmDialog } from "../components/Modal";
import Icon from "../components/Icon";
import { Appointment, AppointmentStatus } from "../types";

type Filter = "TODOS" | AppointmentStatus;

const FILTERS: Filter[] = ["TODOS", "PENDENTE", "ACEITO", "RECUSADO"];

export default function Appointments() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("TODOS");
  // Acao pendente de confirmacao (aceitar/recusar)
  const [pending, setPending] = useState<{ id: string; status: "ACEITO" | "RECUSADO" } | null>(null);

  const isClinic = user?.role === "CLINIC";

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet("/appointments");
      setItems(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmAction() {
    if (!pending) return;
    try {
      await apiSend(`/appointments/${pending.id}/status`, "PATCH", { status: pending.status });
      toast.success(pending.status === "ACEITO" ? "Agendamento aceito." : "Agendamento recusado.");
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPending(null);
    }
  }

  const counts = useMemo(() => {
    return {
      total: items.length,
      PENDENTE: items.filter((a) => a.status === "PENDENTE").length,
      ACEITO: items.filter((a) => a.status === "ACEITO").length,
      RECUSADO: items.filter((a) => a.status === "RECUSADO").length,
    };
  }, [items]);

  const visible = filter === "TODOS" ? items : items.filter((a) => a.status === filter);

  return (
    <div>
      <h2>Agendamentos</h2>

      {!loading && items.length > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{counts.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card pendente">
            <span className="stat-num">{counts.PENDENTE}</span>
            <span className="stat-label">Pendentes</span>
          </div>
          <div className="stat-card aceito">
            <span className="stat-num">{counts.ACEITO}</span>
            <span className="stat-label">Aceitos</span>
          </div>
          <div className="stat-card recusado">
            <span className="stat-num">{counts.RECUSADO}</span>
            <span className="stat-label">Recusados</span>
          </div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "TODOS" ? "Todos" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Icon name="event_busy" size={48} className="empty-icon" />
          <p>
            {isClinic
              ? "Nenhum paciente agendou ainda. Os agendamentos aparecerao aqui."
              : "Voce ainda nao tem agendamentos. Busque uma clinica para comecar."}
          </p>
        </div>
      ) : visible.length === 0 ? (
        <p className="muted">Nenhum agendamento com esse status.</p>
      ) : (
        visible.map((a) => {
          const photo = isClinic ? a.patient.photoUrl : a.clinic.photoUrl;
          const name = isClinic ? a.patient.fullName : a.clinic.clinicName;
          return (
            <div className="card list-item" key={a.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img className="avatar" src={photo || ""} alt="" />
                <div>
                  <strong>
                    {name}
                    {!isClinic && <span className="muted"> · {a.clinic.specialty}</span>}
                  </strong>
                  <div className="muted">
                    <Icon name="calendar_month" size={16} className="icon-inline" />
                    {new Date(a.date).toLocaleString("pt-BR")}
                  </div>
                  {a.reason && <div className="muted">Motivo: {a.reason}</div>}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`badge ${a.status}`}>{a.status}</span>
                {isClinic && a.status === "PENDENTE" && (
                  <>
                    <button className="btn success" onClick={() => setPending({ id: a.id, status: "ACEITO" })}>
                      Aceitar
                    </button>
                    <button className="btn danger" onClick={() => setPending({ id: a.id, status: "RECUSADO" })}>
                      Recusar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      <ConfirmDialog
        open={!!pending}
        title={pending?.status === "ACEITO" ? "Aceitar agendamento?" : "Recusar agendamento?"}
        message={
          pending?.status === "ACEITO"
            ? "O paciente sera notificado de que a consulta foi aceita."
            : "O paciente sera notificado de que a consulta foi recusada."
        }
        confirmLabel={pending?.status === "ACEITO" ? "Aceitar" : "Recusar"}
        variant={pending?.status === "ACEITO" ? "success" : "danger"}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
