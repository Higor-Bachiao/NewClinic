export type Role = "PATIENT" | "CLINIC";

export interface User {
  id: string;
  role: Role;
  name: string;
  photoUrl?: string | null;
}

export interface Clinic {
  id: string;
  clinicName: string;
  ownerName: string;
  specialty: string;
  photoUrl?: string | null;
  openTime: string;
  closeTime: string;
  disabledDays: string;
}

export type AppointmentStatus = "PENDENTE" | "ACEITO" | "RECUSADO";

export interface Appointment {
  id: string;
  date: string;
  reason?: string | null;
  status: AppointmentStatus;
  clinic: { id: string; clinicName: string; specialty: string; photoUrl?: string | null };
  patient: { id: string; fullName: string; photoUrl?: string | null };
}
