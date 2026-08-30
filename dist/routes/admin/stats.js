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
const statsSchema = z.object({
    categoryId: z.number().int(),
    percentage: z.number().min(0).max(100),
    isActive: z.boolean().optional(),
});
// CREATE
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = statsSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const { categoryId, percentage, isActive } = parsed.data;
        // Check if category exists
        const category = yield prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ status: false, error: "Kategori tidak ditemukan" });
        }
        const stat = yield prisma.stats.create({
            data: { categoryId, percentage, isActive: isActive !== null && isActive !== void 0 ? isActive : true },
        });
        res.status(201).json({ status: true, data: stat });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// READ
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield prisma.stats.findMany({ include: { category: true } });
        res.status(200).json({ status: true, data: stats });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// UPDATE
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = statsSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const stat = yield prisma.stats.update({
            where: { id: Number(req.params.id) },
            data: parsed.data,
        });
        res.status(200).json({ status: true, data: stat });
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
        const existing = yield prisma.stats.findUnique({ where: { id: Number(req.params.id) } });
        if (!existing) {
            return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
        }
        yield prisma.stats.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ status: true, message: "Data berhasil dihapus" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
export default router;
