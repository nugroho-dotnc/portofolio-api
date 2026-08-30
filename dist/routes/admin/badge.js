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
const badgeSchema = z.object({
    title: z.string(),
    description: z.string(),
    imagePath: z.string(),
    credentialUrl: z.string().optional(),
    categoryId: z.number().int(),
    issuerId: z.number().int().nullable().optional(),
});
// CREATE
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = badgeSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const { title, description, imagePath, credentialUrl, categoryId, issuerId } = parsed.data;
        const exist = yield prisma.badge.findFirst({ where: { title } });
        if (exist) {
            return res.status(409).json({ status: false, error: `Badge dengan nama ${title} sudah ada` });
        }
        const badge = yield prisma.badge.create({
            data: { title, description, imagePath, credentialUrl, categoryId, issuerId },
        });
        res.status(201).json({ status: true, data: badge });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// READ
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const badges = yield prisma.badge.findMany({ include: { category: true, issuer: true } });
        res.status(200).json({ status: true, data: badges });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// UPDATE
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = badgeSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const badge = yield prisma.badge.update({
            where: { id: Number(req.params.id) },
            data: parsed.data,
        });
        res.status(200).json({ status: true, data: badge });
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
        const existing = yield prisma.badge.findUnique({ where: { id: Number(req.params.id) } });
        if (!existing) {
            return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
        }
        yield prisma.badge.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ status: true, message: "Data berhasil dihapus" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
export default router;
