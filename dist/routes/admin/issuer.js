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
import { z } from "zod";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { prisma } from "../../lib/prisma.js";
const router = Router();
router.use(requireAdmin);
const issuerSchema = z.object({
    name: z.string(),
    imagePath: z.string(),
});
// CREATE
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = issuerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const { name, imagePath } = parsed.data;
        const exist = yield prisma.issuer.findFirst({ where: { name } });
        if (exist) {
            return res.status(409).json({ status: false, error: `Issuer dengan nama ${name} sudah ada` });
        }
        const issuer = yield prisma.issuer.create({
            data: { name, imagePath },
        });
        res.status(201).json({ status: true, data: issuer });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// READ
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issuers = yield prisma.issuer.findMany();
        res.status(200).json({ status: true, data: issuers });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// UPDATE
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = issuerSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const issuer = yield prisma.issuer.update({
            where: { id: Number(req.params.id) },
            data: parsed.data,
        });
        res.status(200).json({ status: true, data: issuer });
    }
    catch (e) {
        if (e.code === "P2025") {
            return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
        }
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// DELETE
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = yield prisma.issuer.findUnique({ where: { id: Number(req.params.id) } });
        if (!existing) {
            return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
        }
        yield prisma.issuer.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ status: true, message: "Data berhasil dihapus" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
export default router;
