import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, requireRole } from "../auth/middleware";

const router = Router();

// --- Paciente solicita agendamento ---
router.post("/", authenticate, requireRole("PATIENT"), async (req, res) => {
  const { clinicId, date, reason } = req.body as {
    clinicId?: string;
    date?: string;
    reason?: string;
  };

  if (!clinicId || !date) {
    return res.status(400).json({ error: "Informe a clinica e a data" });
  }

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return res.status(404).json({ error: "Clinica nao encontrada" });

  const requested = new Date(date);
  if (isNaN(requested.getTime())) {
    return res.status(400).json({ error: "Data invalida" });
  }

  // Valida disponibilidade: dia da semana nao pode estar desabilitado
  const disabled = clinic.disabledDays
    ? clinic.disabledDays.split(",").map((d) => Number(d))
    : [];
  if (disabled.includes(requested.getDay())) {
    return res.status(400).json({ error: "A clinica nao atende neste dia" });
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: req.user!.id,
      clinicId,
      date: requested,
      reason: reason || null,
    },
  });

  res.status(201).json(appointment);
});

// --- Lista agendamentos do usuario logado (paciente ou clinica) ---
router.get("/", authenticate, async (req, res) => {
  const user = req.user!;
  const where = user.role === "PATIENT" ? { patientId: user.id } : { clinicId: user.id };

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      clinic: { select: { id: true, clinicName: true, specialty: true, photoUrl: true } },
      patient: { select: { id: true, fullName: true, photoUrl: true } },
    },
    orderBy: { date: "asc" },
  });

  res.json(appointments);
});

// --- Clinica aceita ou recusa ---
router.patch("/:id/status", authenticate, requireRole("CLINIC"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: "ACEITO" | "RECUSADO" };

  if (status !== "ACEITO" && status !== "RECUSADO") {
    return res.status(400).json({ error: "Status deve ser ACEITO ou RECUSADO" });
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.clinicId !== req.user!.id) {
    return res.status(404).json({ error: "Agendamento nao encontrado" });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  res.json(updated);
});

export default router;
