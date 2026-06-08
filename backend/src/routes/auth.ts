import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { signToken } from "../auth/jwt";
import { upload } from "../upload";

const router = Router();

function photoUrl(filename?: string) {
  return filename ? `/uploads/${filename}` : null;
}

// --- Cadastro de Paciente ---
router.post("/register/patient", upload.single("photo"), async (req, res) => {
  const { fullName, username, cpf, email, password, confirmPassword } = req.body;

  if (!fullName || !username || !cpf || !email || !password) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatorios" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "As senhas nao conferem" });
  }

  const exists = await prisma.patient.findFirst({
    where: { OR: [{ email }, { username }, { cpf }] },
  });
  if (exists) {
    return res.status(409).json({ error: "Email, username ou CPF ja cadastrado" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const patient = await prisma.patient.create({
    data: {
      fullName,
      username,
      cpf,
      email,
      passwordHash,
      photoUrl: photoUrl(req.file?.filename),
    },
  });

  const token = signToken({ id: patient.id, role: "PATIENT", name: patient.fullName });
  return res.status(201).json({
    token,
    user: { id: patient.id, role: "PATIENT", name: patient.fullName, photoUrl: patient.photoUrl },
  });
});

// --- Cadastro de Clinica ---
router.post("/register/clinic", upload.single("photo"), async (req, res) => {
  const { clinicName, ownerName, cnpj, email, password, confirmPassword, specialty } = req.body;

  if (!clinicName || !ownerName || !cnpj || !email || !password || !specialty) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatorios" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "As senhas nao conferem" });
  }

  const exists = await prisma.clinic.findFirst({
    where: { OR: [{ email }, { cnpj }] },
  });
  if (exists) {
    return res.status(409).json({ error: "Email ou CNPJ ja cadastrado" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const clinic = await prisma.clinic.create({
    data: {
      clinicName,
      ownerName,
      cnpj,
      email,
      passwordHash,
      specialty,
      photoUrl: photoUrl(req.file?.filename),
    },
  });

  const token = signToken({ id: clinic.id, role: "CLINIC", name: clinic.clinicName });
  return res.status(201).json({
    token,
    user: { id: clinic.id, role: "CLINIC", name: clinic.clinicName, photoUrl: clinic.photoUrl },
  });
});

// --- Login ---
// Espera { email, password, role: "PATIENT" | "CLINIC" }
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Informe email, senha e perfil" });
  }

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { email } });
    if (patient && (await bcrypt.compare(password, patient.passwordHash))) {
      const token = signToken({ id: patient.id, role: "PATIENT", name: patient.fullName });
      return res.json({
        token,
        user: { id: patient.id, role: "PATIENT", name: patient.fullName, photoUrl: patient.photoUrl },
      });
    }
  } else if (role === "CLINIC") {
    const clinic = await prisma.clinic.findUnique({ where: { email } });
    if (clinic && (await bcrypt.compare(password, clinic.passwordHash))) {
      const token = signToken({ id: clinic.id, role: "CLINIC", name: clinic.clinicName });
      return res.json({
        token,
        user: { id: clinic.id, role: "CLINIC", name: clinic.clinicName, photoUrl: clinic.photoUrl },
      });
    }
  } else {
    return res.status(400).json({ error: "Perfil invalido" });
  }

  return res.status(401).json({ error: "Credenciais invalidas" });
});

export default router;
