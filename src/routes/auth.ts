import { Router } from "express";
import bcrypt from "bcrypt";
import {z} from "zod"
import {prisma} from "../lib/prisma.ts"
import { signToken } from "../lib/jwt.ts";

const router = Router()

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  try {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({status: false, error: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({status: false, error: "Email sudah terdaftar" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: "admin" },
    });

    res.status(201).json({status: true, data: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err); // <- ini yang akan kasih tau pesan error PrismaClientKnownRequestError lengkap
    res.status(500).json({status: false, error: "Terjadi kesalahan server" });
  }
});

router.post("/login", async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(400).json({status: false, error: parsed.error.flatten()});
    }

    const {email, password} = parsed.data;

    const user = await prisma.user.findUnique({where: {email}});

    if(!user) {
        return res.status(401).json({status: false, error: "Email atau password salah"});
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if(!isValid){
        return res.status(401).json({status: false, error: "Email atau password salah"});
    }

    const token = signToken({userId: user.id, role: user.role});
    res.json({status: true, data: {token, user: {id: user.id, email: user.email, role: user.role}}})
});

export default router