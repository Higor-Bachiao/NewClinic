import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, requireRole } from "../auth/middleware";

const router = Router();

// Especialidades disponiveis (espelha o frontend)
export const SPECIALTIES = [
  "Dermatologista",
  "Cardiologista",
  "Ortopedista",
  "Oftalmologista",
  "Pediatra",
  "Psicologo",
  "Nutricionista",
];

router.get("/specialties", (_req, res) => {
  res.json(SPECIALTIES);
});

// --- Busca de clinicas (paciente) ---
// Filtros opcionais: ?name=...&specialty=...
router.get("/", authenticate, async (req, res) => {
  const { name, specialty } = req.query as { name?: string; specialty?: string };

  const clinics = await prisma.clinic.findMany({
    where: {
      ...(name ? { clinicName: { contains: name, mode: "insensitive" } } : {}),
      ...(specialty ? { specialty } : {}),
    },
    select: {
      id: true,
      clinicName: true,
      ownerName: true,
      specialty: true,
      photoUrl: true,
      openTime: true,
      closeTime: true,
      disabledDays: true,
    },
    orderBy: { clinicName: "asc" },
  });

  res.json(clinics);
});

// --- Disponibilidade da propria clinica (leitura) ---
router.get("/me/availability", authenticate, requireRole("CLINIC"), async (req, res) => {
  const clinic = await prisma.clinic.findUnique({
    where: { id: req.user!.id },
    select: { openTime: true, closeTime: true, disabledDays: true },
  });
  if (!clinic) return res.status(404).json({ error: "Clinica nao encontrada" });
  res.json(clinic);
});

// --- Atualiza disponibilidade (clinica) ---
router.put("/me/availability", authenticate, requireRole("CLINIC"), async (req, res) => {
  const { openTime, closeTime, disabledDays } = req.body as {
    openTime?: string;
    closeTime?: string;
    disabledDays?: number[];
  };

  const clinic = await prisma.clinic.update({
    where: { id: req.user!.id },
    data: {
      ...(openTime ? { openTime } : {}),
      ...(closeTime ? { closeTime } : {}),
      ...(disabledDays ? { disabledDays: disabledDays.join(",") } : {}),
    },
    select: { openTime: true, closeTime: true, disabledDays: true },
  });

  res.json(clinic);
});

export default router;
