import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { authenticate } from "../auth/middleware";
import { signToken } from "../auth/jwt";
import { upload } from "../upload";

const router = Router();

function photoUrl(filename?: string) {
  return filename ? `/uploads/${filename}` : undefined;
}

// --- Le o perfil do usuario logado (paciente ou clinica) ---
router.get("/me", authenticate, async (req, res) => {
  const user = req.user!;

  if (user.role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: { id: user.id },
      select: { id: true, fullName: true, username: true, cpf: true, email: true, photoUrl: true },
    });
    if (!patient) return res.status(404).json({ error: "Paciente nao encontrado" });
    return res.json({ role: "PATIENT", ...patient });
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      clinicName: true,
      ownerName: true,
      cnpj: true,
      email: true,
      specialty: true,
      photoUrl: true,
    },
  });
  if (!clinic) return res.status(404).json({ error: "Clinica nao encontrada" });
  return res.json({ role: "CLINIC", ...clinic });
});

// --- Atualiza o perfil do usuario logado ---
// Aceita multipart (foto opcional) e troca de senha opcional.
router.put("/me", authenticate, upload.single("photo"), async (req, res) => {
  const user = req.user!;
  const { email, password, confirmPassword } = req.body as Record<string, string>;

  if (password && password !== confirmPassword) {
    return res.status(400).json({ error: "As senhas nao conferem" });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: "A senha precisa ter ao menos 6 caracteres" });
  }

  const newPhoto = photoUrl(req.file?.filename);
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  if (user.role === "PATIENT") {
    const { fullName, username, cpf } = req.body as Record<string, string>;
    if (!fullName || !username || !cpf || !email) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatorios" });
    }

    // Verifica conflitos com outros pacientes (exclui o proprio registro)
    const clash = await prisma.patient.findFirst({
      where: { AND: [{ id: { not: user.id } }, { OR: [{ email }, { username }, { cpf }] }] },
    });
    if (clash) return res.status(409).json({ error: "Email, username ou CPF ja em uso" });

    const patient = await prisma.patient.update({
      where: { id: user.id },
      data: {
        fullName,
        username,
        cpf,
        email,
        ...(newPhoto ? { photoUrl: newPhoto } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    const token = signToken({ id: patient.id, role: "PATIENT", name: patient.fullName });
    return res.json({
      token,
      user: { id: patient.id, role: "PATIENT", name: patient.fullName, photoUrl: patient.photoUrl },
    });
  }

  // CLINIC
  const { clinicName, ownerName, cnpj, specialty } = req.body as Record<string, string>;
  if (!clinicName || !ownerName || !cnpj || !email || !specialty) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatorios" });
  }

  const clash = await prisma.clinic.findFirst({
    where: { AND: [{ id: { not: user.id } }, { OR: [{ email }, { cnpj }] }] },
  });
  if (clash) return res.status(409).json({ error: "Email ou CNPJ ja em uso" });

  const clinic = await prisma.clinic.update({
    where: { id: user.id },
    data: {
      clinicName,
      ownerName,
      cnpj,
      email,
      specialty,
      ...(newPhoto ? { photoUrl: newPhoto } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  const token = signToken({ id: clinic.id, role: "CLINIC", name: clinic.clinicName });
  return res.json({
    token,
    user: { id: clinic.id, role: "CLINIC", name: clinic.clinicName, photoUrl: clinic.photoUrl },
  });
});

export default router;
