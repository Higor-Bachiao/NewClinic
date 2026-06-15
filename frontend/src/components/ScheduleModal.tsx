import { useMemo, useState } from "react";
import Modal from "./Modal";
import { apiSend } from "../api";
import { useToast } from "./Toast";
import { Clinic } from "../types";

// Modal de agendamento com calendario. O paciente escolhe um dia disponivel,
// um horario dentro do funcionamento da clinica, e confirma a consulta.

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Gera horarios de 30 em 30 minutos entre abertura e fechamento.
function buildTimeSlots(openTime: string, closeTime: string): string[] {
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  const slots: string[] = [];
  for (let t = start; t < end; t += 30) {
    slots.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return slots;
}

export default function ScheduleModal({
  clinic,
  open,
  onClose,
  onScheduled,
}: {
  clinic: Clinic | null;
  open: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}) {
  const toast = useToast();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const disabledDays = useMemo(
    () => (clinic?.disabledDays ? clinic.disabledDays.split(",").filter(Boolean).map(Number) : []),
    [clinic]
  );

  const timeSlots = useMemo(
    () => (clinic ? buildTimeSlots(clinic.openTime, clinic.closeTime) : []),
    [clinic]
  );

  // Reinicia o estado quando o modal abre para uma clinica.
  function reset() {
    setSelectedDay(null);
    setSelectedTime("");
    setReason("");
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  function handleClose() {
    reset();
    onClose();
  }

  if (!clinic) return null;

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Monta as celulas do calendario (em branco antes do dia 1).
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  function isDisabled(date: Date) {
    if (date < startOfToday) return true; // dia no passado
    if (disabledDays.includes(date.getDay())) return true; // clinica fechada
    return false;
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function sameDay(a: Date | null, b: Date | null) {
    return !!a && !!b && a.toDateString() === b.toDateString();
  }

  // Desabilita horarios que ja passaram quando o dia escolhido e hoje.
  function isSlotDisabled(slot: string) {
    if (!selectedDay || !sameDay(selectedDay, today)) return false;
    const [h, m] = slot.split(":").map(Number);
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    return h * 60 + m <= nowMinutes;
  }

  async function confirm() {
    if (!selectedDay) {
      toast.warning("Escolha um dia no calendario.");
      return;
    }
    if (!selectedTime) {
      toast.warning("Escolha um horario disponivel.");
      return;
    }
    if (isSlotDisabled(selectedTime)) {
      toast.warning("Esse horario ja passou. Escolha outro.");
      return;
    }
    const dateStr = `${selectedDay.getFullYear()}-${pad(selectedDay.getMonth() + 1)}-${pad(
      selectedDay.getDate()
    )}T${selectedTime}:00`;

    setSaving(true);
    try {
      await apiSend("/appointments", "POST", {
        clinicId: clinic!.id,
        date: dateStr,
        reason: reason.trim() || undefined,
      });
      toast.success(
        `Consulta solicitada em ${clinic!.clinicName} para ${selectedDay.toLocaleDateString(
          "pt-BR"
        )} as ${selectedTime}. Acompanhe em "Agendamentos".`
      );
      onScheduled?.();
      handleClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={`Agendar em ${clinic.clinicName}`} onClose={handleClose} width={520}>
      <p className="muted" style={{ marginTop: 0 }}>
        {clinic.specialty} · atende das {clinic.openTime} as {clinic.closeTime}
      </p>

      <div className="cal-header">
        <button type="button" className="cal-nav" onClick={prevMonth} aria-label="Mes anterior">
          ‹
        </button>
        <strong>
          {MONTHS[viewMonth]} {viewYear}
        </strong>
        <button type="button" className="cal-nav" onClick={nextMonth} aria-label="Proximo mes">
          ›
        </button>
      </div>

      <div className="cal-grid cal-weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-weekday">
            {w}
          </div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((date, i) =>
          date === null ? (
            <div key={`b${i}`} className="cal-cell empty" />
          ) : (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled(date)}
              className={`cal-cell ${sameDay(date, selectedDay) ? "selected" : ""} ${
                sameDay(date, today) ? "today" : ""
              }`}
              onClick={() => {
                setSelectedDay(date);
                setSelectedTime("");
              }}
            >
              {date.getDate()}
            </button>
          )
        )}
      </div>

      {selectedDay && (
        <>
          <p style={{ marginBottom: 8 }}>
            Horarios para <strong>{selectedDay.toLocaleDateString("pt-BR")}</strong>:
          </p>
          <div className="timeslot-grid">
            {timeSlots.map((t) => (
              <button
                key={t}
                type="button"
                disabled={isSlotDisabled(t)}
                className={`timeslot-btn ${selectedTime === t ? "selected" : ""}`}
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {timeSlots.every(isSlotDisabled) && (
            <p className="muted" style={{ marginTop: 0 }}>
              Nao ha mais horarios disponiveis hoje. Escolha outro dia.
            </p>
          )}

          <div className="field" style={{ marginTop: 16 }}>
            <label>Motivo (opcional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: consulta de rotina"
            />
          </div>
        </>
      )}

      <div className="modal-actions">
        <button className="btn secondary" onClick={handleClose} disabled={saving}>
          Cancelar
        </button>
        <button className="btn success" onClick={confirm} disabled={saving}>
          {saving ? "Agendando..." : "Confirmar agendamento"}
        </button>
      </div>
    </Modal>
  );
}
