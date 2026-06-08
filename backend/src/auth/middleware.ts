import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload, Role } from "./jwt";

// Estende o Request do Express para carregar o usuario autenticado
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token nao fornecido" });
  }

  const token = header.replace("Bearer ", "");
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalido ou expirado" });
  }
}

// Garante que o usuario autenticado tem um dos papeis permitidos
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso negado para este perfil" });
    }
    next();
  };
}
