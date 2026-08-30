var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
const router = Router();
const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = authSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const { email, password } = parsed.data;
        const existing = yield prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ status: false, error: "Email sudah terdaftar" });
        }
        const passwordHash = yield bcrypt.hash(password, 10);
        const user = yield prisma.user.create({
            data: { email, passwordHash, role: "admin" },
        });
        res.status(201).json({ status: true, data: { id: user.id, email: user.email } });
    }
    catch (err) {
        console.error(err); // <- ini yang akan kasih tau pesan error PrismaClientKnownRequestError lengkap
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ status: false, error: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ status: false, error: "Email atau password salah" });
    }
    const isValid = yield bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({ status: false, error: "Email atau password salah" });
    }
    const token = signToken({ userId: user.id, role: user.role });
    res.json({ status: true, data: { token, user: { id: user.id, email: user.email, role: user.role } } });
}));
export default router;
