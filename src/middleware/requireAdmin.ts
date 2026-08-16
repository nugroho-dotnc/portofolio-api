import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({status: false, error: "Token tidak ditemukan" });
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== "admin") {
      return res.status(403).json({status: false, error: "Akses ditolak" });
    }
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({status: false, error: "Token tidak valid atau kedaluwarsa" });
  }
}