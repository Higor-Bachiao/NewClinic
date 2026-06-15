import dotenv from "dotenv";
// Carrega .env da pasta env/ antes de importar módulos que usam Prisma
dotenv.config({ path: `${process.cwd()}/env/.env` });

import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth";
import clinicRoutes from "./routes/clinics";
import appointmentRoutes from "./routes/appointments";
import reviewRoutes from "./routes/reviews";
import { uploadDir } from "./upload";

const app = express();

app.use(cors());
app.use(express.json());

// Arquivos enviados (fotos de perfil)
app.use("/uploads", express.static(uploadDir));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/clinics", clinicRoutes);
app.use("/clinics/:clinicId/reviews", reviewRoutes);
app.use("/appointments", appointmentRoutes);

const PORT = Number(process.env.PORT) || 3333;
app.listen(PORT, () => {
  console.log(`NewClinic API rodando em http://localhost:${PORT}`);
});
