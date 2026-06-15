import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import { useToast } from "../components/Toast";

const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terca" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sabado" },
];

export default function Availability() {
  const toast = useToast();
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [disabledDays, setDisabledDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/clinics/me/availability").then((data) => {
      setOpenTime(data.openTime);
      setCloseTime(data.closeTime);
      setDisabledDays(
        data.disabledDays ? data.disabledDays.split(",").filter(Boolean).map(Number) : []
      );
      setLoading(false);
    });
  }, []);

  function toggleDay(day: number) {
    setDisabledDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function save() {
    if (openTime >= closeTime) {
      toast.warning("O horario de abertura deve ser antes do fechamento.");
      return;
    }
    try {
      await apiSend("/clinics/me/availability", "PUT", { openTime, closeTime, disabledDays });
      toast.success("Disponibilidade salva com sucesso!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (loading) return <p className="muted">Carregando...</p>;

  return (
    <div>
      <h2>Disponibilidade</h2>

      <div className="card">
        <div className="row">
          <div className="field">
            <label>Horario de Abertura</label>
            <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
          </div>
          <div className="field">
            <label>Horario de Fechamento</label>
            <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
          </div>
        </div>

        <p style={{ marginBottom: 8 }}>Dias desabilitados (clique para alternar):</p>
        <div className="row" style={{ marginBottom: 16 }}>
          {DAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              className={`btn ${disabledDays.includes(d.value) ? "danger" : "secondary"}`}
              onClick={() => toggleDay(d.value)}
            >
              {d.label}
              {disabledDays.includes(d.value) ? " (fechado)" : ""}
            </button>
          ))}
        </div>

        <button className="btn" onClick={save}>
          Salvar
        </button>
      </div>
    </div>
  );
}
