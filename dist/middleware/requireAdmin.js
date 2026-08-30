import { verifyToken } from "../lib/jwt.js";
export function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) {
        return res.status(401).json({ status: false, error: "Token tidak ditemukan" });
    }
    try {
        const payload = verifyToken(token);
        if (payload.role !== "admin") {
            return res.status(403).json({ status: false, error: "Akses ditolak" });
        }
        req.user = payload;
        next();
    }
    catch (_a) {
        return res.status(401).json({ status: false, error: "Token tidak valid atau kedaluwarsa" });
    }
}
