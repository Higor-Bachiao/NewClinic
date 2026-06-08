import React, { useState } from 'react';
import './ClinicDashboard.css';

type Appointment = {
  id: string;
  patient: string;
  time: string; // ISO or human
  specialty: string;
  status: 'pending' | 'confirmed' | 'done' | 'cancelled';
};

type Timeslot = {
  time: string; // e.g. "09:00"
  available: boolean;
};

type Props = {
  clinicName?: string;
  initialAppointments?: Appointment[];
  initialTimeslots?: Timeslot[];
  specialties?: string[];
};

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patient: 'Mariana Silva', time: '2026-06-09T09:00:00', specialty: 'Cardiologia', status: 'pending' },
  { id: 'a2', patient: 'João Pereira', time: '2026-06-09T09:30:00', specialty: 'Dermatologia', status: 'pending' },
  { id: 'a3', patient: 'Ana Costa', time: '2026-06-09T10:00:00', specialty: 'Pediatria', status: 'confirmed' },
];

const MOCK_TIMESLOTS: Timeslot[] = [
  { time: '09:00', available: false },
  { time: '09:30', available: false },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '14:00', available: true },
];

const MOCK_SPECIALTIES = ['Cardiologia', 'Dermatologia', 'Pediatria', 'Ginecologia'];

export default function ClinicDashboard({
  clinicName = 'Minha Clínica',
  initialAppointments = MOCK_APPOINTMENTS,
  initialTimeslots = MOCK_TIMESLOTS,
  specialties = MOCK_SPECIALTIES,
}: Props){
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [timeslots] = useState<Timeslot[]>(initialTimeslots);

  const pending = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');

  function markDone(id: string){
    setAppointments(prev => prev.map(a => a.id === id ? {...a, status: 'done'} : a));
  }

  return (
    <div className="clinic-dashboard">
      <div className="dashboard-header">
        <h2>{clinicName}</h2>
        <div className="header-actions">
          <button className="btn">Exportar</button>
          <button className="btn primary">Novo Agendamento</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="pending-list card">
          <h3>Agendamentos pendentes</h3>
          {pending.length === 0 ? (
            <div className="empty">Nenhum agendamento pendente</div>
          ) : (
            <ul>
              {pending.map(a => (
                <li key={a.id} className="appointment-row">
                  <div className="ap-time">{new Date(a.time).toLocaleString()}</div>
                  <div className="ap-main">
                    <div className="ap-patient">{a.patient}</div>
                    <div className="ap-meta">{a.specialty} • {a.status}</div>
                  </div>
                  <div className="ap-actions">
                    <button className="btn" onClick={()=>markDone(a.id)}>Concluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="right-column">
          <div className="card schedule">
            <h4>Horários (hoje)</h4>
            <div className="timeslots">
              {timeslots.map(t => (
                <button key={t.time} className={`timeslot ${t.available ? 'available' : 'busy'}`} aria-pressed={!t.available}>
                  {t.time}
                </button>
              ))}
            </div>
          </div>

          <div className="card specialties">
            <h4>Especialidades</h4>
            <ul>
              {specialties.map(s => (<li key={s}>{s}</li>))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
