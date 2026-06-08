import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "troque-este-segredo";

export type Role = "PATIENT" | "CLINIC";

export interface TokenPayload {
  id: string;
  role: Role;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
