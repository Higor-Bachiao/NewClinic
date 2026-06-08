import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import { useAuth } from "../auth";
import { Appointment } from "../types";

export default function Appointments() {
  const { user } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet("/appointments");
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: "ACEITO" | "RECUSADO") {
    await apiSend(`/appointments/${id}/status`, "PATCH", { status });
    load();
  }

  const isClinic = user?.role === "CLINIC";

  return (
    <div>
      <h2>Agendamentos</h2>

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="muted">Nenhum agendamento por enquanto.</p>
      ) : (
        items.map((a) => (
          <div className="card list-item" key={a.id}>
            <div>
              <strong>
                {isClinic ? a.patient.fullName : a.clinic.clinicName}
                {!isClinic && <span className="muted"> · {a.clinic.specialty}</span>}
              </strong>
              <div className="muted">{new Date(a.date).toLocaleString("pt-BR")}</div>
              {a.reason && <div className="muted">Motivo: {a.reason}</div>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`badge ${a.status}`}>{a.status}</span>
              {isClinic && a.status === "PENDENTE" && (
                <>
                  <button className="btn success" onClick={() => updateStatus(a.id, "ACEITO")}>
                    Aceitar
                  </button>
                  <button className="btn danger" onClick={() => updateStatus(a.id, "RECUSADO")}>
                    Recusar
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
