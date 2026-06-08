import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const clinics = [
    { clinicName: "Clinica Pele Saudavel", ownerName: "Dra. Ana", cnpj: "11111111000111", email: "pele@clinic.com", specialty: "Dermatologista" },
    { clinicName: "CardioVida", ownerName: "Dr. Bruno", cnpj: "22222222000122", email: "cardio@clinic.com", specialty: "Cardiologista" },
    { clinicName: "Orto Center", ownerName: "Dr. Carlos", cnpj: "33333333000133", email: "orto@clinic.com", specialty: "Ortopedista" },
    { clinicName: "Visao Clara", ownerName: "Dra. Diana", cnpj: "44444444000144", email: "olhos@clinic.com", specialty: "Oftalmologista" },
  ];

  for (const c of clinics) {
    await prisma.clinic.upsert({
      where: { email: c.email },
      update: {},
      create: { ...c, passwordHash },
    });
  }

  // Paciente de exemplo
  await prisma.patient.upsert({
    where: { email: "paciente@teste.com" },
    update: {},
    create: {
      fullName: "Paciente Teste",
      username: "paciente",
      cpf: "12345678900",
      email: "paciente@teste.com",
      passwordHash,
    },
  });

  console.log("Seed concluido. Senha padrao: 123456");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
