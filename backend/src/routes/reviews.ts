import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, requireRole } from "../auth/middleware";

const router = Router({ mergeParams: true });

// GET /clinics/:clinicId/reviews — lista reviews e média da clínica
router.get("/", authenticate, async (req, res) => {
  const { clinicId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { clinicId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      patient: { select: { id: true, fullName: true, photoUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  res.json({ reviews, avg, total: reviews.length });
});

// POST /clinics/:clinicId/reviews — paciente avalia a clínica (cria ou atualiza)
router.post("/", authenticate, requireRole("PATIENT"), async (req, res) => {
  const { clinicId } = req.params;
  const { rating, comment } = req.body as { rating?: number; comment?: string };

  if (rating === undefined || rating < 0 || rating > 5) {
    return res.status(400).json({ error: "Nota deve ser entre 0 e 5" });
  }

  // Arredonda para múltiplo de 0.5
  const rounded = Math.round(rating * 2) / 2;

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return res.status(404).json({ error: "Clinica nao encontrada" });

  const review = await prisma.review.upsert({
    where: { patientId_clinicId: { patientId: req.user!.id, clinicId } },
    update: { rating: rounded, comment: comment || null },
    create: { patientId: req.user!.id, clinicId, rating: rounded, comment: comment || null },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      patient: { select: { id: true, fullName: true, photoUrl: true } },
    },
  });

  res.status(201).json(review);
});

export default router;
