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
import z from "zod";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { prisma } from "../../lib/prisma.js";
const router = Router();
router.use(requireAdmin);
const categorieSchemas = z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
    is_expertise: z.boolean(),
    is_active: z.boolean()
});
// POST
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = categorieSchemas.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const { icon, title, description, is_expertise, is_active } = parsed.data;
        const exist = yield prisma.category.findFirst({ where: { title } });
        if (exist) {
            return res.status(409).json({ status: false, error: `Kategori dengan nama ${title} sudah ada` });
        }
        const category = yield prisma.category.create({
            data: {
                title, icon, description, isExpertise: is_expertise, isActive: is_active
            }
        });
        res.status(201).json({ status: true, data: category });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// READ
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield prisma.category.findMany({ where: { isActive: true } });
        return res.status(200).json({ status: true, data: category });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// PUT
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = categorieSchemas.partial().safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        if (parsed.data.title) {
            const exist = yield prisma.category.findFirst({ where: { title: parsed.data.title, id: { not: Number(req.params.id) } } });
            if (exist) {
                return res.status(409).json({ status: false, error: `Kategori dengan nama ${parsed.data.title} sudah ada` });
            }
        }
        const { icon, title, description, is_expertise, is_active } = parsed.data;
        const category = yield prisma.category.update({
            where: { id: Number(req.params.id) },
            data: {
                title, icon, description, isExpertise: is_expertise, isActive: is_active
            }
        });
        res.status(200).json({ status: true, data: category });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
// DELETE
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = prisma.category.findUnique({ where: { id: Number(req.params.id) } });
        if (!existing) {
            return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
        }
        const category = yield prisma.category.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
        return res.status(200).json({ status: true, data: category });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
    }
}));
export default router;
